from functools import wraps
import logging

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import render, get_object_or_404, redirect

from .forms import ProjectForm
from .models import Project, ProjectImage
from analytics.services import track_project_view
import os


logger = logging.getLogger(__name__)


def _save_project_gallery(project, images):
    if not images:
        return

    last_image = project.gallery.order_by('-order', '-created_at').first()
    next_order = (last_image.order + 1) if last_image else 0

    for offset, image in enumerate(images):
        ProjectImage.objects.create(
            project=project,
            image=image,
            title='',
            order=next_order + offset,
        )


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
    projects = Project.objects.all()
    return render(request, "projects/list.html", {"projects": projects})


def project_detail(request, slug):
    project = get_object_or_404(Project.objects.prefetch_related('gallery'), slug=slug)
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
            with transaction.atomic():
                project = form.save()
                _save_project_gallery(project, form.cleaned_data.get('gallery_images'))
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
            with transaction.atomic():
                project = form.save()
                _save_project_gallery(project, form.cleaned_data.get('gallery_images'))
            messages.success(request, "Proyecto actualizado correctamente.")
            return redirect('dashboard')
    else:
        form = ProjectForm(instance=project)
    return render(request, "projects/edit.html", {"form": form, "project": project})


@staff_required
def delete_project_image(request, slug, image_id):
    project = get_object_or_404(Project, slug=slug)
    image = get_object_or_404(ProjectImage, pk=image_id, project=project)

    if request.method != 'POST':
        raise PermissionDenied

    image.delete()
    messages.success(request, "Imagen eliminada correctamente.")
    return redirect('project_edit', slug=project.slug)


@staff_required
def delete_project(request, slug):
    project = get_object_or_404(Project, slug=slug)
    if request.method == 'POST':
        project.delete()
        messages.success(request, "Proyecto eliminado correctamente.")
        return redirect('dashboard')
    return render(request, "projects/delete.html", {"project": project})