from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.exceptions import PermissionDenied
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
import logging
from django.views.decorators.http import require_POST
from django.views.generic import TemplateView

from analytics.models import AnalyticsEvent, ProjectView
from analytics.services import get_visible_pageviews_queryset
from core.forms import SiteSettingsForm
from core.models import ContactMessage, SiteSettings
from projects.models import Project


def _staff_check(user):
    return user.is_active and user.is_staff


class DashboardView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    template_name = "adminpanel/dashboard.html"

    def test_func(self):
        return self.request.user.is_staff

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        projects = Project.objects.all()
        total = projects.count()
        recent = list(projects[:6])
        last_project = recent[0] if recent else None

        # Compute image presence giving priority to uploaded images (project.image)
        # and using static fallbacks (`static_image_path` property) when available.
        # Note: `static_image_path` is a @property on the model (not a DB field),
        # so we must inspect it in Python for projects lacking an uploaded image.
        uploaded_image_count = projects.exclude(Q(image__isnull=True) | Q(image='')).count()
        no_uploaded_qs = projects.filter(Q(image__isnull=True) | Q(image=''))
        static_fallback_count = 0
        for p in no_uploaded_qs:
            try:
                if getattr(p, 'static_image_path', None):
                    static_fallback_count += 1
            except Exception:
                continue

        with_image = uploaded_image_count + static_fallback_count
        without_image = total - with_image
        with_github = projects.exclude(github_url='').count()
        with_live = projects.exclude(live_url='').count()

        categories = (
            projects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)
        seven_days_ago = now - timezone.timedelta(days=7)
        today = timezone.localdate()

        recent_count = projects.filter(created_at__gte=thirty_days_ago).count()

        # Many of these queries depend on optional analytics/contact tables
        # which may not exist or may be empty on a fresh/ephemeral DB (Render).
        # Wrap them so the dashboard stays tolerant and logs exceptions.
        logger = logging.getLogger(__name__)
        try:
            total_messages = ContactMessage.objects.count()
            unread_messages = ContactMessage.objects.filter(is_read=False).count()

            pageviews = get_visible_pageviews_queryset()

            visits_today = pageviews.filter(created_at__date=today).count()
            visits_7_days = pageviews.filter(created_at__gte=seven_days_ago).count()
            visits_30_days = pageviews.filter(created_at__gte=thirty_days_ago).count()

            top_pages = list(
                pageviews.values('path')
                .annotate(total=Count('id'))
                .order_by('-total')[:5]
            )

            try:
                top_projects = list(
                    ProjectView.objects.values('project__title')
                    .annotate(total=Count('id'))
                    .order_by('-total')[:5]
                )
            except Exception:
                # If ProjectView table is not migrated or fails, fall back to empty
                logger.exception('Failed to compute top_projects; continuing with empty list')
                top_projects = []

            latest_visits = pageviews.order_by('-created_at')[:10]
        except Exception:
            # Any failure (missing tables, migrations not applied) should not
            # break the admin dashboard. Log and provide safe defaults.
            logger.exception('Analytics/contact queries failed; using empty defaults')
            total_messages = 0
            unread_messages = 0
            visits_today = 0
            visits_7_days = 0
            visits_30_days = 0
            top_pages = []
            top_projects = []
            latest_visits = []

        context.update({
            'total_projects': total,
            'recent_projects': recent,
            'last_project_date': last_project.created_at if last_project else None,
            'with_image': with_image,
            'without_image': without_image,
            'image_percentage': round((with_image / total) * 100) if total else 0,
            'with_github': with_github,
            'with_live': with_live,
            'categories': categories,
            'recent_count': recent_count,
            'total_messages': total_messages,
            'unread_messages': unread_messages,
            'visits_today': visits_today,
            'visits_7_days': visits_7_days,
            'visits_30_days': visits_30_days,
            'top_pages': top_pages,
            'top_projects': top_projects,
            'latest_visits': latest_visits,
            'user': self.request.user,
        })

        return context


@login_required
def analytics_dashboard(request):
    if not _staff_check(request.user):
        raise PermissionDenied

    now = timezone.now()
    seven_days_ago = now - timezone.timedelta(days=7)

    pageviews = get_visible_pageviews_queryset()
    recent_pageviews = pageviews.filter(
        created_at__gte=seven_days_ago
    )

    total_pageviews = recent_pageviews.count()

    unique_visitors = (
        recent_pageviews
        .exclude(visitor_hash__isnull=True)
        .exclude(visitor_hash='')
        .values('visitor_hash')
        .distinct()
        .count()
    )

    total_sessions = (
        recent_pageviews
        .exclude(session_hash__isnull=True)
        .exclude(session_hash='')
        .values('session_hash')
        .distinct()
        .count()
    )

    pages_per_session = (
        round(total_pageviews / total_sessions, 1)
        if total_sessions
        else 0
    )

    visits_by_day = list(
        recent_pageviews
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(total=Count('id'))
        .order_by('-day')
    )

    top_pages = list(
        pageviews
        .values('path')
        .annotate(total=Count('id'))
        .order_by('-total')[:20]
    )

    top_projects = list(
        ProjectView.objects
        .values('project__title')
        .annotate(total=Count('id'))
        .order_by('-total')[:20]
    )

    latest_visits = pageviews.order_by('-created_at')[:10]

    recent_events = AnalyticsEvent.objects.filter(
        created_at__gte=seven_days_ago
    )

    github_clicks = recent_events.filter(
        event_type='github_click'
    ).count()

    demo_clicks = recent_events.filter(
        event_type='demo_click'
    ).count()

    total_conversions = recent_events.count()

    converted_sessions = (
        recent_events
        .exclude(session_hash__isnull=True)
        .exclude(session_hash='')
        .values('session_hash')
        .distinct()
        .count()
    )

    conversion_rate = (
        round((converted_sessions / total_sessions) * 100, 1)
        if total_sessions
        else 0
    )

    return render(
        request,
        'adminpanel/analytics.html',
        {
            'total_pageviews': total_pageviews,
            'unique_visitors': unique_visitors,
            'total_sessions': total_sessions,
            'pages_per_session': pages_per_session,
            'visits_by_day': visits_by_day,
            'top_pages': top_pages,
            'top_projects': top_projects,
            'latest_visits': latest_visits,
            'github_clicks': github_clicks,
            'demo_clicks': demo_clicks,
            'total_conversions': total_conversions,
            'conversion_rate': conversion_rate,
        },
    )

@login_required
def settings_view(request):
    if not _staff_check(request.user):
        raise PermissionDenied
    site_settings = SiteSettings.get_solo()

    if request.method == 'POST':
        form = SiteSettingsForm(request.POST, instance=site_settings)
        if form.is_valid():
            form.save()
            messages.success(request, 'ConfiguraciÃ³n actualizada correctamente.')
            return redirect('adminpanel_settings')
    else:
        form = SiteSettingsForm(instance=site_settings)

    return render(request, 'adminpanel/settings.html', {'form': form})


@login_required
def contact_messages_view(request):
    if not _staff_check(request.user):
        raise PermissionDenied
    all_messages = ContactMessage.objects.all().order_by('-created_at')

    return render(
        request,
        'adminpanel/contact_messages.html',
        {
            'messages_list': all_messages,
            'total_messages': all_messages.count(),
            'unread_messages': all_messages.filter(is_read=False).count(),
        },
    )


@login_required
def contact_message_detail_view(request, pk):
    if not _staff_check(request.user):
        raise PermissionDenied
    message_obj = get_object_or_404(ContactMessage, pk=pk)

    if not message_obj.is_read:
        message_obj.is_read = True
        message_obj.save(update_fields=['is_read'])

    return render(
        request,
        'adminpanel/contact_message_detail.html',
        {
            'message_obj': message_obj,
        },
    )


@login_required
@require_POST
def mark_contact_message_read(request, pk):
    if not _staff_check(request.user):
        raise PermissionDenied
    message_obj = get_object_or_404(ContactMessage, pk=pk)
    message_obj.is_read = True
    message_obj.save(update_fields=['is_read'])

    messages.success(request, 'Mensaje marcado como leÃ­do.')
    return redirect('adminpanel_contact_messages')


@login_required
@require_POST
def mark_contact_message_replied(request, pk):
    if not _staff_check(request.user):
        raise PermissionDenied
    message_obj = get_object_or_404(ContactMessage, pk=pk)
    message_obj.is_replied = True

    if not message_obj.is_read:
        message_obj.is_read = True
        message_obj.save(update_fields=['is_replied', 'is_read'])
    else:
        message_obj.save(update_fields=['is_replied'])

    messages.success(request, 'Mensaje marcado como respondido.')
    return redirect('adminpanel_contact_message_detail', pk=pk)


