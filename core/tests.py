from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import Client, TestCase, override_settings
from django.urls import reverse

from core.forms import SiteSettingsForm
from core.models import ContactMessage, SiteSettings
from projects.forms import ProjectForm


class SiteSettingsModelTests(TestCase):
	def test_get_solo_creates_or_returns_single_row(self):
		first = SiteSettings.get_solo()
		second = SiteSettings.get_solo()

		self.assertEqual(first.pk, second.pk)
		self.assertEqual(SiteSettings.objects.count(), 1)
		self.assertEqual(first.site_name, 'Jose Noe')
		self.assertEqual(first.professional_title, 'Backend Engineer')
		self.assertEqual(first.contact_email, 'jmnt2012@gmail.com')
		self.assertEqual(first.contact_phone, '+56 9 30387145')
		self.assertEqual(first.whatsapp_number, '+56930387145')
		self.assertEqual(first.footer_text, 'Backend Developer')


class FormsValidationTests(TestCase):
	def test_site_settings_form_is_valid_with_required_fields(self):
		instance = SiteSettings.get_solo()
		form = SiteSettingsForm(
			data={
				'site_name': 'Jose Noe',
				'professional_title': 'Backend Engineer',
				'contact_email': 'jmnt2012@gmail.com',
				'contact_phone': '+56 9 30387145',
				'whatsapp_number': '+56930387145',
				'github_url': 'https://github.com/JoseNoeT',
				'linkedin_url': 'https://linkedin.com/in/josenoe',
				'footer_text': 'Backend Developer',
				'is_active': True,
			},
			instance=instance,
		)
		self.assertTrue(form.is_valid(), form.errors)

	def test_project_form_remains_valid(self):
		form = ProjectForm(
			data={
				'title': 'Proyecto Demo',
				'short_description': 'Descripcion corta del proyecto',
				'description': 'Descripcion completa de prueba para mantener compatibilidad del formulario.',
				'category': 'personal',
				'technologies': 'Django, PostgreSQL',
				'github_url': '',
				'live_url': '',
			}
		)
		self.assertTrue(form.is_valid(), form.errors)


@override_settings(
	EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
	CONTACT_EMAIL_TO='jmnt2012@gmail.com',
	DEFAULT_FROM_EMAIL='noreply@example.com',
)
class ContactViewTests(TestCase):
	def setUp(self):
		self.url = reverse('contact')
		self.valid_payload = {
			'name': 'Jose Noe',
			'email': 'visitor@example.com',
			'subject': 'Consulta de proyecto',
			'message': 'Hola, me interesa conversar sobre una posible colaboracion profesional.',
			'honeypot': '',
		}

	def test_contact_get_returns_200(self):
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, 200)

	def test_contact_valid_post_sends_email_and_redirects(self):
		response = self.client.post(self.url, data=self.valid_payload)

		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, self.url)
		self.assertEqual(len(mail.outbox), 1)
		self.assertEqual(mail.outbox[0].to, ['jmnt2012@gmail.com'])
		self.assertEqual(mail.outbox[0].reply_to, ['visitor@example.com'])
		self.assertEqual(ContactMessage.objects.count(), 1)

	def test_contact_invalid_post_does_not_send_email(self):
		payload = self.valid_payload.copy()
		payload['message'] = 'Muy corto'

		response = self.client.post(self.url, data=payload)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(mail.outbox), 0)
		self.assertEqual(ContactMessage.objects.count(), 0)

	def test_contact_honeypot_filled_does_not_send_email(self):
		payload = self.valid_payload.copy()
		payload['honeypot'] = 'spam-bot'

		response = self.client.post(self.url, data=payload)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(mail.outbox), 0)
		self.assertEqual(ContactMessage.objects.count(), 0)

	def test_contact_handles_email_backend_failure(self):
		with patch('core.views.EmailMessage.send', side_effect=Exception('SMTP down')):
			response = self.client.post(self.url, data=self.valid_payload)

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'No fue posible enviar tu mensaje en este momento')
		self.assertEqual(ContactMessage.objects.count(), 1)


class AdminAccessFlowTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.superuser = get_user_model().objects.create_superuser(
            username='access_test_admin', email='admin@example.test', password='test-only-password'
        )
        cls.regular = get_user_model().objects.create_user(
            username='access_test_regular', password='test-only-password'
        )

    def login_with_csrf(self, client, username, **extra):
        client.get(reverse('login'))
        return client.post(reverse('login'), {
            'username': username, 'password': 'test-only-password',
            'csrfmiddlewaretoken': client.cookies['csrftoken'].value, **extra,
        })

    def test_anonymous_footer_exposes_login_not_dashboard(self):
        response = self.client.get(reverse('home'))
        self.assertContains(response, reverse('login') + '?next=' + reverse('dashboard'))
        self.assertContains(response, 'Acceso administrativo')
        self.assertNotContains(response, 'id="navbar-admin"')
        response = self.client.get(reverse('dashboard'))
        self.assertRedirects(response, reverse('login') + '?next=' + reverse('dashboard'))

    def test_superuser_login_reaches_dashboard_and_exposes_controls(self):
        client = Client(enforce_csrf_checks=True)
        response = self.login_with_csrf(client, self.superuser.username)
        self.assertRedirects(response, reverse('dashboard'))
        home = client.get(reverse('home'))
        self.assertContains(home, 'id="navbar-admin"')
        self.assertContains(home, 'class="nav-cta-mobile"')
        self.assertContains(home, 'Cerrar sesión')
        self.assertNotContains(home, 'Acceso administrativo')

    def test_nonstaff_cannot_access_dashboard_or_staff_links(self):
        self.client.force_login(self.regular)
        self.assertEqual(self.client.get(reverse('dashboard')).status_code, 403)
        self.assertNotContains(self.client.get(reverse('home')), 'id="navbar-admin"')

    def test_logout_requires_post_and_csrf_then_removes_session(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.superuser)
        self.assertEqual(client.get(reverse('logout')).status_code, 405)
        self.assertEqual(client.post(reverse('logout')).status_code, 403)
        client.get(reverse('home'))
        response = client.post(reverse('logout'), {
            'csrfmiddlewaretoken': client.cookies['csrftoken'].value,
        })
        self.assertRedirects(response, reverse('home'))
        self.assertNotIn('_auth_user_id', client.session)
        self.assertRedirects(client.get(reverse('dashboard')),
                             reverse('login') + '?next=' + reverse('dashboard'))

    def test_login_rejects_missing_csrf(self):
        client = Client(enforce_csrf_checks=True)
        response = client.post(reverse('login'), {
            'username': self.superuser.username, 'password': 'test-only-password',
        })
        self.assertEqual(response.status_code, 403)
        self.assertNotIn('_auth_user_id', client.session)

    def test_login_does_not_redirect_to_external_next(self):
        client = Client(enforce_csrf_checks=True)
        response = self.login_with_csrf(client, self.superuser.username,
                                       next='https://example.invalid/private')
        self.assertRedirects(response, reverse('dashboard'))
