from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
import logging
from django.views.decorators.http import require_POST
from django.views.generic import TemplateView

from analytics.models import ProjectView
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

        with_image = projects.exclude(image='').count()
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
@user_passes_test(_staff_check)
def analytics_dashboard(request):
    now = timezone.now()
    seven_days_ago = now - timezone.timedelta(days=7)

    pageviews = get_visible_pageviews_queryset()

    visits_by_day = list(
        pageviews.filter(created_at__gte=seven_days_ago)
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(total=Count('id'))
        .order_by('-day')
    )

    top_pages = list(
        pageviews.values('path')
        .annotate(total=Count('id'))
        .order_by('-total')[:20]
    )

    top_projects = list(
        ProjectView.objects.values('project__title')
        .annotate(total=Count('id'))
        .order_by('-total')[:20]
    )

    latest_visits = pageviews.order_by('-created_at')[:10]

    return render(
        request,
        'adminpanel/analytics.html',
        {
            'visits_by_day': visits_by_day,
            'top_pages': top_pages,
            'top_projects': top_projects,
            'latest_visits': latest_visits,
        },
    )


@login_required
@user_passes_test(_staff_check)
def settings_view(request):
    site_settings = SiteSettings.get_solo()

    if request.method == 'POST':
        form = SiteSettingsForm(request.POST, instance=site_settings)
        if form.is_valid():
            form.save()
            messages.success(request, 'Configuración actualizada correctamente.')
            return redirect('adminpanel_settings')
    else:
        form = SiteSettingsForm(instance=site_settings)

    return render(request, 'adminpanel/settings.html', {'form': form})


@login_required
@user_passes_test(_staff_check)
def contact_messages_view(request):
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
@user_passes_test(_staff_check)
def contact_message_detail_view(request, pk):
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
@user_passes_test(_staff_check)
@require_POST
def mark_contact_message_read(request, pk):
    message_obj = get_object_or_404(ContactMessage, pk=pk)
    message_obj.is_read = True
    message_obj.save(update_fields=['is_read'])

    messages.success(request, 'Mensaje marcado como leído.')
    return redirect('adminpanel_contact_messages')


@login_required
@user_passes_test(_staff_check)
@require_POST
def mark_contact_message_replied(request, pk):
    message_obj = get_object_or_404(ContactMessage, pk=pk)
    message_obj.is_replied = True

    if not message_obj.is_read:
        message_obj.is_read = True
        message_obj.save(update_fields=['is_replied', 'is_read'])
    else:
        message_obj.save(update_fields=['is_replied'])

    messages.success(request, 'Mensaje marcado como respondido.')
    return redirect('adminpanel_contact_message_detail', pk=pk)