from django.shortcuts import render
from projects.models import Project

def home(request):
	projects = Project.objects.all()[:3]  # Últimos 3 proyectos
	return render(request, 'home.html', {'projects': projects})


def contact(request):
	"""Página de contacto sencilla."""
	return render(request, 'contact.html')


def about(request):
	"""Página 'Sobre mí'."""
	return render(request, 'about.html')


def services(request):
	"""Página de servicios."""
	return render(request, 'services.html')


def metodologia(request):
	"""Página de metodología."""
	return render(request, 'metodologia.html')
