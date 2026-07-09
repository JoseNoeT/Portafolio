from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from projects.models import Project


User = get_user_model()


class ProjectAdminCRUDTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = User.objects.create_user('staff', password='pw')
        cls.staff.is_staff = True
        cls.staff.save()

        cls.user = User.objects.create_user('user', password='pw')

    def test_create_edit_delete_permissions_and_flow(self):
        create_url = reverse('project_create')

        # anonymous -> redirect
        resp = self.client.get(create_url)
        self.assertEqual(resp.status_code, 302)

        # non-staff -> 403
        self.client.login(username='user', password='pw')
        resp2 = self.client.get(create_url)
        self.assertEqual(resp2.status_code, 403)

        # staff can access and create
        # use force_login for reliable authentication
        self.client.force_login(self.staff)
        resp3 = self.client.get(create_url)
        self.assertEqual(resp3.status_code, 200)

        post_data = {
            'title': 'QA Project',
            'short_description': 'short',
            'description': 'desc',
            'category': 'personal',
        }
        resp_post = self.client.post(create_url, post_data, follow=True)
        self.assertEqual(resp_post.status_code, 200)
        self.assertTrue(Project.objects.filter(title='QA Project').exists())

        proj = Project.objects.get(title='QA Project')

        # appears in public listing
        resp_list = self.client.get(reverse('projects_list'))
        self.assertContains(resp_list, 'QA Project')

        # appears in API
        resp_api = self.client.get(reverse('api-project-list'))
        self.assertEqual(resp_api.status_code, 200)
        data = resp_api.json()
        titles = [p.get('title') for p in data]
        self.assertIn('QA Project', titles)

        # edit
        edit_url = reverse('project_edit', kwargs={'slug': proj.slug})
        resp_edit_get = self.client.get(edit_url)
        self.assertEqual(resp_edit_get.status_code, 200)
        resp_edit_post = self.client.post(edit_url, {'title': 'QA Project Edited', 'short_description': 's', 'description': 'd', 'category': 'personal'}, follow=True)
        self.assertEqual(resp_edit_post.status_code, 200)
        proj.refresh_from_db()
        self.assertEqual(proj.title, 'QA Project Edited')

        # delete
        delete_url = reverse('project_delete', kwargs={'slug': proj.slug})
        resp_delete_get = self.client.get(delete_url)
        self.assertEqual(resp_delete_get.status_code, 200)
        resp_delete_post = self.client.post(delete_url, follow=True)
        self.assertEqual(resp_delete_post.status_code, 200)
        self.assertFalse(Project.objects.filter(pk=proj.pk).exists())

    def test_image_upload_validation(self):
        # use force_login for reliable authentication
        self.client.force_login(self.staff)
        create_url = reverse('project_create')

        # invalid extension
        bad_file = SimpleUploadedFile('hack.txt', b'content', content_type='text/plain')
        data = {
            'title': 'ImageTest1',
            'short_description': 'short',
            'description': 'desc',
            'category': 'personal',
        }
        # send file as part of form data (TestClient expects files in data)
        data['image'] = bad_file
        resp = self.client.post(create_url, data)
        # invalid extension must not create the project and should re-render form (200)
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Project.objects.filter(title='ImageTest1').exists())

        # oversize file (>5MB)
        large_content = b'a' * (5 * 1024 * 1024 + 1)
        large_file = SimpleUploadedFile('large.jpg', large_content, content_type='image/jpeg')
        data2 = data.copy()
        data2['title'] = 'ImageTest2'
        data2['image'] = large_file
        resp2 = self.client.post(create_url, data2)
        # oversize must not create the project and should re-render form (200)
        self.assertEqual(resp2.status_code, 200)
        self.assertFalse(Project.objects.filter(title='ImageTest2').exists())
