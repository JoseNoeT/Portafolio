from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from projects.models import Project

class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "adminpanel/dashboard.html"
    login_url = "/dashboard/login/"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        projects = Project.objects.all().order_by('-created_at')
        total_projects = projects.count()
        recent_projects = projects[:5]
        last_project = projects.first()
        last_project_date = last_project.created_at if last_project else None

        context['total_projects'] = total_projects
        context['recent_projects'] = recent_projects
        context['last_project_date'] = last_project_date
        return context
