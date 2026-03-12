from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Count
from django.utils import timezone
from django.views.generic import TemplateView
from projects.models import Project


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

        # Stats
        with_image = projects.exclude(image='').count()
        without_image = total - with_image
        with_github = projects.exclude(github_url='').count()
        with_live = projects.exclude(live_url='').count()

        # Category breakdown
        categories = (
            projects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        recent_count = projects.filter(created_at__gte=thirty_days_ago).count()

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
            'user': self.request.user,
        })
        return context
