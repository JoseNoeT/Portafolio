from functools import wraps
import logging

from django.contrib import messages
from django.contrib.staticfiles import finders
from django.templatetags.static import static
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.shortcuts import render, get_object_or_404, redirect

from .forms import ProjectForm
from .models import Project
from analytics.services import track_project_view
import os


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Auth helper
# ---------------------------------------------------------------------------

def staff_required(view_func):
    """Allow access only to active staff users."""
    @wraps(view_func)
    @login_required
    def wrapper(request, *args, **kwargs):
        user = request.user
        if not (user and user.is_active and user.is_staff):
            raise PermissionDenied
        return view_func(request, *args, **kwargs)

    return wrapper


# ---------------------------------------------------------------------------
# Public views
# ---------------------------------------------------------------------------

def list_projects(request):
    projects = list(Project.objects.order_by('-updated_at'))
    labels = {'professional': 'Profesionales', 'academic': 'Académicos',
              'personal': 'Personales', 'engineering': 'Ingeniería'}
    categories = [
        {'value': value, 'label': labels.get(value, label),
         'count': sum(project.category == value for project in projects)}
        for value, label in Project.CATEGORY_CHOICES
        if any(project.category == value for project in projects)
    ]
    technologies = {}
    for project in projects:
        for technology in project.tech_list:
            technologies.setdefault(technology.casefold(), technology)
    cv_path = 'docs/CV_Jose_Noe.pdf'
    return render(request, "projects/list.html", {
        'projects': projects, 'project_categories': categories,
        'project_technologies': sorted(technologies.values(), key=str.casefold),
        'cv_url': static(cv_path) if finders.find(cv_path) else None,
    })


def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)
    try:
        track_project_view(request, project)
    except Exception:
        logger.exception('Project analytics tracking failed')
    return render(request, "projects/detail.html", {"project": project})


def project_modal(request, slug):
    """Return compact HTML fragment for the project detail modal."""
    project = get_object_or_404(Project, slug=slug)
    try:
        track_project_view(request, project)
    except Exception:
        logger.exception('Project analytics tracking failed')
    return render(request, "projects/_modal_content.html", {"project": project})


# ---------------------------------------------------------------------------
# Admin CRUD views (staff only)
# ---------------------------------------------------------------------------

@staff_required
def create_project(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, "Proyecto creado correctamente.")
            return redirect('dashboard')
    else:
        form = ProjectForm()
    return render(request, "projects/create.html", {"form": form})


@staff_required
def edit_project(request, slug):
    project = get_object_or_404(Project, slug=slug)
    if request.method == 'POST':
        form = ProjectForm(request.POST, request.FILES, instance=project)
        if form.is_valid():
            form.save()
            messages.success(request, "Proyecto actualizado correctamente.")
            return redirect('dashboard')
    else:
        form = ProjectForm(instance=project)
    return render(request, "projects/edit.html", {"form": form, "project": project})


@staff_required
def delete_project(request, slug):
    project = get_object_or_404(Project, slug=slug)
    if request.method == 'POST':
        project.delete()
        messages.success(request, "Proyecto eliminado correctamente.")
        return redirect('dashboard')
    return render(request, "projects/delete.html", {"project": project})
