from functools import wraps

from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render, get_object_or_404, redirect

from .forms import ProjectForm
from .models import Project


# ---------------------------------------------------------------------------
# Auth helper
# ---------------------------------------------------------------------------

def staff_required(view_func):
    """Allow access only to active staff users."""
    @wraps(view_func)
    @login_required
    @user_passes_test(lambda u: u.is_active and u.is_staff)
    def wrapper(*args, **kwargs):
        return view_func(*args, **kwargs)
    return wrapper


# ---------------------------------------------------------------------------
# Public views
# ---------------------------------------------------------------------------

def list_projects(request):
    projects = Project.objects.all()
    return render(request, "projects/list.html", {"projects": projects})


def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)
    return render(request, "projects/detail.html", {"project": project})


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