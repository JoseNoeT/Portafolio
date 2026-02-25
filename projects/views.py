from django.shortcuts import render, get_object_or_404
from .models import Project


def list_projects(request):
    projects = Project.objects.all()

    # Procesar tecnologías para cada proyecto
    for project in projects:
        if project.technologies:
            project.tech_list = [
                tech.strip() for tech in project.technologies.split(",")
            ]
        else:
            project.tech_list = []

    return render(request, "projects/list.html", {
        "projects": projects
    })


def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)

    if project.technologies:
        project.tech_list = [
            tech.strip() for tech in project.technologies.split(",")
        ]
    else:
        project.tech_list = []

    return render(request, "projects/detail.html", {
        "project": project
    })