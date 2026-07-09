import logging

from django.conf import settings
from django.contrib import messages
from django.core.mail import EmailMessage
from django.shortcuts import redirect, render
from projects.models import Project

from .forms import ContactForm
from .models import ContactMessage, SiteSettings


logger = logging.getLogger(__name__)


def home(request):
	projects = Project.objects.all()[:3]  # Últimos 3 proyectos
	return render(request, 'home.html', {'projects': projects})


def contact(request):
	site_settings = SiteSettings.get_solo()
	destination_email = site_settings.contact_email or settings.CONTACT_EMAIL_TO
	contact_whatsapp = site_settings.whatsapp_number or settings.CONTACT_WHATSAPP

	if request.method == 'POST':
		form = ContactForm(request.POST)
		if form.is_valid():
			name = form.cleaned_data['name']
			email = form.cleaned_data['email']
			subject = form.cleaned_data['subject']
			message = form.cleaned_data['message']

			ContactMessage.objects.create(
				name=name,
				email=email,
				subject=subject,
				message=message,
				source='contact_form',
			)

			email_body = (
				f"Nombre: {name}\n"
				f"Email: {email}\n"
				f"Asunto: {subject}\n\n"
				f"Mensaje:\n{message}"
			)

			outgoing = EmailMessage(
				subject=f"[Portafolio] {subject}",
				body=email_body,
				from_email=settings.DEFAULT_FROM_EMAIL,
				to=[destination_email],
				reply_to=[email],
			)

			try:
				outgoing.send()
				messages.success(request, 'Gracias por tu mensaje. Te responderé pronto.')
				return redirect('contact')
			except Exception:
				logger.exception('Contact email delivery failed')
				messages.error(
					request,
					'No fue posible enviar tu mensaje en este momento. Intenta nuevamente en unos minutos.',
				)
		else:
			messages.error(request, 'Revisa los campos del formulario e inténtalo nuevamente.')
	else:
		form = ContactForm()

	whatsapp_digits = ''.join(ch for ch in contact_whatsapp if ch.isdigit())
	whatsapp_url = f"https://wa.me/{whatsapp_digits}" if whatsapp_digits else 'https://wa.me/56930387145'
	context = {
		'form': form,
		'contact_email': destination_email,
		'contact_whatsapp': contact_whatsapp,
		'whatsapp_url': whatsapp_url,
	}
	return render(request, 'contact.html', context)


def about(request):
	"""Página 'Sobre mí'."""
	return render(request, 'about.html')


def services(request):
	"""Página de servicios."""
	return render(request, 'services.html')


def metodologia(request):
	"""Página de metodología."""
	return render(request, 'metodologia.html')


def not_found(request, exception):
	"""Render a branded 404 page."""
	return render(request, '404.html', status=404)


def server_error(request):
	"""Render a branded 500 page."""
	return render(request, '500.html', status=500)


def preview_404(request):
	"""Preview route for the custom 404 page in development."""
	return render(request, '404.html', status=404)


def preview_500(request):
	"""Preview route for the custom 500 page in development."""
	return render(request, '500.html', status=500)
