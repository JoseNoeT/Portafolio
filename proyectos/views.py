from django.shortcuts import render
from .models import Project

def list_projects(request):
    projects = Project.objects.all()
    return render(request, "projects.html", {"projects": projects})
from django.shortcuts import render

# Create your views here.
