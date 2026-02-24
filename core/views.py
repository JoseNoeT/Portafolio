from django.shortcuts import render

def home(request):
	return render(request, 'home.html')


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
