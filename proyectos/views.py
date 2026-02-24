from django.shortcuts import render, get_object_or_404
from .models import Project


def list_projects(request):
    projects = Project.objects.all()
    return render(request, "proyectos/list.html", {"projects": projects})


def detail_project(request, pk):
    project = get_object_or_404(Project, pk=pk)
    # If your Project model exposes list-like technologies, adapt in template
    return render(request, "proyectos/detail.html", {"project": project})
