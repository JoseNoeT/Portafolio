from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from projects.models import Project
from core.models import ContactMessage, SiteSettings


User = get_user_model()


class AdminPanelCRUDTests(TestCase):
    def setUp(self):
        # users
        self.staff = User.objects.create_user('staff', password='pw')
        self.staff.is_staff = True
        self.staff.save()

        self.user = User.objects.create_user('user', password='pw')

        # contact message
        self.msg = ContactMessage.objects.create(
            name='Tester',
            email='t@example.com',
            subject='Hello',
            message='This is a test message for adminpanel.',
            source='contact_form',
        )

        # ensure site settings exists
        SiteSettings.get_solo()

        # project
        self.project = Project.objects.create(
            title='Admin Test Project',
            short_description='short',
            description='long',
            category='personal',
        )

    # 1. Permisos base
    def test_anonymous_redirects_dashboard(self):
        url = reverse('dashboard')
        resp = self.client.get(url)
        expected = reverse('login') + '?next=' + url
        self.assertRedirects(resp, expected)

    def test_nonstaff_gets_403_dashboard(self):
        self.client.login(username='user', password='pw')
        resp = self.client.get(reverse('dashboard'))
        self.assertEqual(resp.status_code, 403)

    def test_staff_access_dashboard(self):
        self.client.login(username='staff', password='pw')
        resp = self.client.get(reverse('dashboard'))
        self.assertEqual(resp.status_code, 200)

    # 2. Mensajes de contacto
    def test_staff_can_list_contact_messages(self):
        self.client.login(username='staff', password='pw')
        resp = self.client.get(reverse('adminpanel_contact_messages'))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, self.msg.subject)

    def test_staff_can_open_detail_and_marks_read(self):
        self.client.login(username='staff', password='pw')
        url = reverse('adminpanel_contact_message_detail', kwargs={'pk': self.msg.pk})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.msg.refresh_from_db()
        self.assertTrue(self.msg.is_read)

    def test_post_mark_read_and_get_405(self):
        self.client.login(username='staff', password='pw')
        url = reverse('adminpanel_contact_message_read', kwargs={'pk': self.msg.pk})
        # GET should be 405
        resp_get = self.client.get(url)
        self.assertEqual(resp_get.status_code, 405)

        # POST marks read
        resp_post = self.client.post(url)
        self.assertRedirects(resp_post, reverse('adminpanel_contact_messages'))
        self.msg.refresh_from_db()
        self.assertTrue(self.msg.is_read)

    def test_post_mark_replied_and_get_405(self):
        self.client.login(username='staff', password='pw')
        url = reverse('adminpanel_contact_message_replied', kwargs={'pk': self.msg.pk})
        resp_get = self.client.get(url)
        self.assertEqual(resp_get.status_code, 405)

        resp_post = self.client.post(url)
        self.assertRedirects(resp_post, reverse('adminpanel_contact_message_detail', kwargs={'pk': self.msg.pk}))
        self.msg.refresh_from_db()
        self.assertTrue(self.msg.is_replied)
        self.assertTrue(self.msg.is_read)

    def test_detail_nonexistent_returns_404(self):
        self.client.login(username='staff', password='pw')
        resp = self.client.get(reverse('adminpanel_contact_message_detail', kwargs={'pk': 99999}))
        self.assertEqual(resp.status_code, 404)

    # 3. SiteSettings
    def test_staff_can_open_and_post_settings(self):
        self.client.login(username='staff', password='pw')
        url = reverse('adminpanel_settings')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        # POST update
        data = {
            'site_name': 'Nuevo Nombre',
            'professional_title': 'Title',
            'contact_email': 'new@example.com',
            'contact_phone': '+1',
            'whatsapp_number': '+1',
            'github_url': '',
            'linkedin_url': '',
            'footer_text': 'f',
            'is_active': True,
        }
        resp_post = self.client.post(url, data)
        self.assertRedirects(resp_post, reverse('adminpanel_settings'))
        self.assertEqual(SiteSettings.get_solo().site_name, 'Nuevo Nombre')

    def test_nonstaff_cannot_post_settings(self):
        self.client.login(username='user', password='pw')
        url = reverse('adminpanel_settings')
        resp = self.client.post(url, {'site_name': 'X'})
        self.assertEqual(resp.status_code, 403)

    # 4. Analytics
    def test_staff_can_open_analytics_without_data(self):
        # Ensure no PageView or ProjectView exists
        self.client.login(username='staff', password='pw')
        resp = self.client.get(reverse('adminpanel_analytics'))
        self.assertEqual(resp.status_code, 200)

    # 5. Projects admin CRUD
    def test_staff_can_create_edit_delete_project_and_api_reflects(self):
        self.client.login(username='staff', password='pw')

        # Create
        create_url = reverse('project_create')
        resp_get = self.client.get(create_url)
        self.assertEqual(resp_get.status_code, 200)

        post_data = {
            'title': 'Created via Admin',
            'short_description': 'short',
            'description': 'desc',
            'category': 'personal',
        }
        resp_post = self.client.post(create_url, post_data, follow=True)
        # should redirect to dashboard
        self.assertEqual(resp_post.status_code, 200)
        self.assertTrue(Project.objects.filter(title='Created via Admin').exists())

        proj = Project.objects.get(title='Created via Admin')

        # appears in public listing
        resp_list = self.client.get(reverse('projects_list'))
        self.assertContains(resp_list, 'Created via Admin')

        # appears in API list
        resp_api = self.client.get(reverse('api-project-list'))
        self.assertEqual(resp_api.status_code, 200)
        data = resp_api.json()
        titles = [p.get('title') for p in data]
        self.assertIn('Created via Admin', titles)

        # Edit
        edit_url = reverse('project_edit', kwargs={'slug': proj.slug})
        resp_edit_get = self.client.get(edit_url)
        self.assertEqual(resp_edit_get.status_code, 200)

        resp_edit_post = self.client.post(edit_url, {'title': 'Edited Title', 'short_description': 's', 'description': 'd', 'category': 'personal'}, follow=True)
        self.assertEqual(resp_edit_post.status_code, 200)
        proj.refresh_from_db()
        self.assertEqual(proj.title, 'Edited Title')

        # Delete
        delete_url = reverse('project_delete', kwargs={'slug': proj.slug})
        resp_delete_get = self.client.get(delete_url)
        self.assertEqual(resp_delete_get.status_code, 200)

        resp_delete_post = self.client.post(delete_url, follow=True)
        self.assertEqual(resp_delete_post.status_code, 200)
        self.assertFalse(Project.objects.filter(pk=proj.pk).exists())

        # API should no longer list it
        resp_api2 = self.client.get(reverse('api-project-list'))
        data2 = resp_api2.json()
        titles2 = [p.get('title') for p in data2]
        self.assertNotIn('Edited Title', titles2)

    # 6. Permisos proyectos
    def test_project_crud_permissions(self):
        create_url = reverse('project_create')
        # anonymous redirect
        resp = self.client.get(create_url)
        expected = reverse('login') + '?next=' + create_url
        self.assertRedirects(resp, expected)

        # normal user gets 403
        self.client.login(username='user', password='pw')
        resp2 = self.client.get(create_url)
        self.assertEqual(resp2.status_code, 403)

        # staff ok
        self.client.login(username='staff', password='pw')
        resp3 = self.client.get(create_url)
        self.assertEqual(resp3.status_code, 200)
