from types import SimpleNamespace

from django.contrib.auth.models import User
from django.test import TestCase, RequestFactory, override_settings
from django.urls import reverse
from django.core import mail

from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import Project
from core.models import ContactMessage
from projects.api.serializers import ProjectSerializer


class ApiMethodsTests(APITestCase):
    def setUp(self):
        self.project = Project.objects.create(
            title='E2E Project',
            short_description='E2E',
            description='E2E description',
            category='personal',
        )

    def test_post_not_allowed_on_list(self):
        url = reverse('api-project-list')
        resp = self.client.post(url, {})
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put_delete_not_allowed_on_detail(self):
        url = reverse('api-project-detail', kwargs={'slug': self.project.slug})
        put_resp = self.client.put(url, {})
        del_resp = self.client.delete(url)
        self.assertEqual(put_resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(del_resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class SerializerImageUrlTests(TestCase):
    def test_image_url_builds_absolute_with_request(self):
        p = Project.objects.create(
            title='With Image',
            short_description='desc',
            description='desc',
            category='personal',
        )
        # mock a FieldFile-like object with a url attribute
        p.image = SimpleNamespace(url='/media/test-image.png')

        factory = RequestFactory()
        request = factory.get('/')

        ser = ProjectSerializer(p, context={'request': request})
        data = ser.data

        self.assertIn('image_url', data)
        # when image exists, serializer should return absolute URL
        self.assertTrue(data['image_url'].endswith('/media/test-image.png'))


class AdminPermissionsTests(TestCase):
    def setUp(self):
        self.client = self.client
        self.staff = User.objects.create_user('staff', password='pw')
        self.staff.is_staff = True
        self.staff.save()

        self.user = User.objects.create_user('user', password='pw')

    def test_anonymous_redirects_from_dashboard(self):
        url = reverse('dashboard')
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (302, 301))

    def test_nonstaff_forbidden(self):
        self.client.login(username='user', password='pw')
        url = reverse('dashboard')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 403)

    def test_staff_can_access(self):
        self.client.login(username='staff', password='pw')
        url = reverse('dashboard')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)


class ProjectCRUDPermissionsTests(TestCase):
    def setUp(self):
        self.staff = User.objects.create_user('staff2', password='pw')
        self.staff.is_staff = True
        self.staff.save()

        self.user = User.objects.create_user('user2', password='pw')

    def test_create_requires_staff(self):
        url = reverse('project_create')
        # anonymous -> redirect to login
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (302, 301))

        # normal user -> forbidden
        self.client.login(username='user2', password='pw')
        resp2 = self.client.get(url)
        self.assertEqual(resp2.status_code, 403)

        # staff -> ok
        self.client.login(username='staff2', password='pw')
        resp3 = self.client.get(url)
        self.assertEqual(resp3.status_code, 200)


class ContactFlowTests(TestCase):
    def test_get_contact_page(self):
        url = reverse('contact')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_post_valid_creates_message_and_sends_email(self):
        url = reverse('contact')
        data = {
            'name': 'Tester',
            'email': 'tester@example.com',
            'subject': 'Hola desde test',
            'message': 'Este es un mensaje de prueba con suficiente longitud.',
            'honeypot': '',
        }
        resp = self.client.post(url, data, follow=True)
        self.assertEqual(resp.status_code, 200)

        self.assertTrue(ContactMessage.objects.filter(email='tester@example.com').exists())
        self.assertEqual(len(mail.outbox), 1)

    def test_post_honeypot_blocks_submission(self):
        url = reverse('contact')
        data = {
            'name': 'Bot',
            'email': 'bot@example.com',
            'subject': 'Spam',
            'message': 'x' * 30,
            'honeypot': 'i am a bot',
        }
        resp = self.client.post(url, data)
        # form invalid -> returns page with status 200 and no message created
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(ContactMessage.objects.filter(email='bot@example.com').exists())
