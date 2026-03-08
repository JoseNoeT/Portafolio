from django.shortcuts import render, get_object_or_404, redirect
from .models import Project
from django import forms

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['title', 'short_description', 'description', 'category', 'technologies']

def list_projects(request):
    projects = Project.objects.all()
    for project in projects:
        if project.technologies:
            project.tech_list = [tech.strip() for tech in project.technologies.split(",")]
        else:
            project.tech_list = []
    return render(request, "projects/list.html", {"projects": projects})

def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)
    if project.technologies:
        project.tech_list = [tech.strip() for tech in project.technologies.split(",")]
    else:
        project.tech_list = []
    return render(request, "projects/detail.html", {"project": project})

def create_project(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            project = form.save(commit=False)
            project.slug = slugify(project.title)
            project.save()
            return redirect('projects_list')
    else:
        form = ProjectForm()
    return render(request, "projects/create.html", {"form": form})

def edit_project(request, slug):
    project = get_object_or_404(Project, slug=slug)
    if request.method == 'POST':
        form = ProjectForm(request.POST, instance=project)
        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = ProjectForm(instance=project)
    return render(request, "projects/edit.html", {"form": form, "project": project})

def delete_project(request, slug):
    project = get_object_or_404(Project, slug=slug)
    if request.method == 'POST':
        project.delete()
        return redirect('dashboard')
    return render(request, "projects/delete.html", {"project": project})