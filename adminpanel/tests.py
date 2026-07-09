from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from core.models import ContactMessage


class AdminPanelAccessTests(TestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.staff_user = self.user_model.objects.create_user(
            username='staff_user',
            email='staff@example.com',
            password='admin1234',
            is_staff=True,
        )
        self.message = ContactMessage.objects.create(
            name='Visitante',
            email='visitante@example.com',
            subject='Consulta',
            message='Mensaje suficientemente largo para validar flujo del panel interno.',
        )

    def test_settings_requires_staff(self):
        self.client.login(username='staff_user', password='admin1234')
        response = self.client.get(reverse('adminpanel_settings'))
        self.assertEqual(response.status_code, 200)

    def test_contact_messages_requires_staff(self):
        self.client.login(username='staff_user', password='admin1234')
        response = self.client.get(reverse('adminpanel_contact_messages'))
        self.assertEqual(response.status_code, 200)

    def test_new_contact_message_is_unread_by_default(self):
        self.assertFalse(self.message.is_read)

    def test_list_contact_messages_does_not_mark_as_read(self):
        self.client.login(username='staff_user', password='admin1234')
        self.client.get(reverse('adminpanel_contact_messages'))
        self.message.refresh_from_db()
        self.assertFalse(self.message.is_read)

    def test_detail_view_marks_message_as_read(self):
        self.client.login(username='staff_user', password='admin1234')
        self.client.get(reverse('adminpanel_contact_message_detail', kwargs={'pk': self.message.pk}))
        self.message.refresh_from_db()
        self.assertTrue(self.message.is_read)

    def test_mark_read_action_marks_message(self):
        self.client.login(username='staff_user', password='admin1234')
        self.client.post(reverse('adminpanel_contact_message_read', kwargs={'pk': self.message.pk}))
        self.message.refresh_from_db()
        self.assertTrue(self.message.is_read)

    def test_unauthenticated_cannot_access_settings(self):
        response = self.client.get(reverse('adminpanel_settings'))
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login/', response.url)

    def test_unauthenticated_cannot_access_messages(self):
        response = self.client.get(reverse('adminpanel_contact_messages'))
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login/', response.url)

    def test_mark_replied_post_and_get_405(self):
        # staff POST works
        self.client.login(username='staff_user', password='admin1234')
        resp_post = self.client.post(reverse('adminpanel_contact_message_replied', kwargs={'pk': self.message.pk}))
        self.assertEqual(resp_post.status_code, 302)
        self.message.refresh_from_db()
        self.assertTrue(self.message.is_replied)
        self.assertTrue(self.message.is_read)

    def test_mark_actions_blocked_for_nonstaff(self):
        # login as normal user
        normal = self.user_model.objects.create_user(username='normal', password='pw')
        self.client.login(username='normal', password='pw')
        list_resp = self.client.get(reverse('adminpanel_contact_messages'))
        # non-staff must be forbidden
        self.assertEqual(list_resp.status_code, 403)
        detail_resp = self.client.get(reverse('adminpanel_contact_message_detail', kwargs={'pk': self.message.pk}))
        self.assertEqual(detail_resp.status_code, 403)
        post_read = self.client.post(reverse('adminpanel_contact_message_read', kwargs={'pk': self.message.pk}))
        self.assertEqual(post_read.status_code, 403)
        post_replied = self.client.post(reverse('adminpanel_contact_message_replied', kwargs={'pk': self.message.pk}))
        self.assertEqual(post_replied.status_code, 403)

    def test_analytics_permission_variants(self):
        url = reverse('adminpanel_analytics')
        # anonymous -> redirect
        resp_anon = self.client.get(url)
        self.assertEqual(resp_anon.status_code, 302)

        # non-staff -> 403
        normal = self.user_model.objects.create_user(username='normal2', password='pw')
        self.client.login(username='normal2', password='pw')
        resp_norm = self.client.get(url)
        self.assertEqual(resp_norm.status_code, 403)

        # staff -> 200
        self.client.login(username='staff_user', password='admin1234')
        resp_staff = self.client.get(url)
        self.assertEqual(resp_staff.status_code, 200)
