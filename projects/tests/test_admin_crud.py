from io import BytesIO
import base64

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.templatetags.static import static
from django.test import TestCase
from django.urls import reverse

from projects.models import Project, ProjectImage


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

    def test_staff_can_upload_and_replace_image_and_see_in_home_and_list(self):
        self.client.force_login(self.staff)
        create_url = reverse('project_create')

        # Try to build a valid PNG using Pillow; fallback to a base64 1x1 PNG
        try:
            from PIL import Image
            bio = BytesIO()
            Image.new('RGBA', (1, 1), (255, 0, 0, 0)).save(bio, format='PNG')
            png_1x1 = bio.getvalue()
        except Exception:
            png_1x1 = base64.b64decode(
                b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
            )
        small_png = SimpleUploadedFile('small.png', png_1x1, content_type='image/png')
        data = {
            'title': 'ImageFlow',
            'short_description': 'short',
            'description': 'desc',
            'category': 'personal',
            'image': small_png,
        }
        resp = self.client.post(create_url, data, follow=True)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(Project.objects.filter(title='ImageFlow').exists(), msg=resp.content.decode())

        proj = Project.objects.get(title='ImageFlow')
        # Image saved on model
        self.assertTrue(proj.image and proj.image.name)

        # Appears on public listing with image tag
        resp_list = self.client.get(reverse('projects_list'))
        self.assertContains(resp_list, 'ImageFlow')
        self.assertContains(resp_list, 'img')

        # Appears on Home (first 3 projects)
        resp_home = self.client.get(reverse('home'))
        self.assertContains(resp_home, 'ImageFlow')
        # Project image URL should be rendered in home template
        self.assertIn(proj.image.url, resp_home.content.decode())

        # Edit: replace image
        edit_url = reverse('project_edit', kwargs={'slug': proj.slug})
        new_png = SimpleUploadedFile('small2.png', png_1x1, content_type='image/png')
        resp_edit = self.client.post(edit_url, {
            'title': proj.title,
            'short_description': proj.short_description,
            'description': proj.description,
            'category': proj.category,
            'image': new_png,
        }, follow=True)
        self.assertEqual(resp_edit.status_code, 200)
        proj.refresh_from_db()
        self.assertIn('small2', proj.image.name)

        # Delete
        delete_url = reverse('project_delete', kwargs={'slug': proj.slug})
        resp_delete = self.client.post(delete_url, follow=True)
        self.assertEqual(resp_delete.status_code, 200)
        self.assertFalse(Project.objects.filter(pk=proj.pk).exists())

    def test_detail_uses_uploaded_image_before_static_fallback(self):
        proj = Project.objects.create(
            title='ImagePriorityProject',
            slug='ferramas',
            short_description='short',
            description='desc',
            category='personal',
        )

        try:
            from PIL import Image
            bio = BytesIO()
            Image.new('RGBA', (1, 1), (255, 0, 0, 0)).save(bio, format='PNG')
            png_1x1 = bio.getvalue()
        except Exception:
            png_1x1 = base64.b64decode(
                b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
            )

        proj.image.save('priority.png', SimpleUploadedFile('priority.png', png_1x1, content_type='image/png'), save=True)

        resp_detail = self.client.get(reverse('project_detail', kwargs={'slug': proj.slug}))
        self.assertEqual(resp_detail.status_code, 200)

        content = resp_detail.content.decode()
        self.assertIn(proj.image.url, content)
        self.assertEqual(content.count(proj.image.url), 2)
        self.assertNotIn(static(proj.static_image_path), content)

    def test_detail_uses_static_fallback_when_no_uploaded_image_exists(self):
        proj = Project.objects.create(
            title='StaticFallbackProject',
            slug='portafolio',
            short_description='short',
            description='desc',
            category='personal',
        )

        resp_detail = self.client.get(reverse('project_detail', kwargs={'slug': proj.slug}))
        self.assertEqual(resp_detail.status_code, 200)

        content = resp_detail.content.decode()
        self.assertIn(static(proj.static_image_path), content)
        self.assertEqual(content.count(static(proj.static_image_path)), 2)

    def test_staff_can_create_project_with_multiple_gallery_images(self):
        self.client.force_login(self.staff)
        create_url = reverse('project_create')

        try:
            from PIL import Image
            bio = BytesIO()
            Image.new('RGBA', (1, 1), (255, 0, 0, 0)).save(bio, format='PNG')
            png_1x1 = bio.getvalue()
        except Exception:
            png_1x1 = base64.b64decode(
                b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
            )

        data = {
            'title': 'Gallery Create',
            'short_description': 'short',
            'description': 'desc',
            'category': 'personal',
            'gallery_images': [
                SimpleUploadedFile('gallery-1.png', png_1x1, content_type='image/png'),
                SimpleUploadedFile('gallery-2.png', png_1x1, content_type='image/png'),
            ],
        }

        response = self.client.post(create_url, data, follow=True)
        self.assertEqual(response.status_code, 200)

        project = Project.objects.get(title='Gallery Create')
        gallery = list(project.gallery.all())

        self.assertEqual(len(gallery), 2)
        self.assertEqual([image.order for image in gallery], [0, 1])
        self.assertTrue(all(image.image.name for image in gallery))

    def test_staff_can_delete_gallery_image(self):
        self.client.force_login(self.staff)

        project = Project.objects.create(
            title='Gallery Delete',
            short_description='short',
            description='desc',
            category='personal',
        )

        try:
            from PIL import Image
            bio = BytesIO()
            Image.new('RGBA', (1, 1), (255, 0, 0, 0)).save(bio, format='PNG')
            png_1x1 = bio.getvalue()
        except Exception:
            png_1x1 = base64.b64decode(
                b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
            )

        gallery_image = ProjectImage.objects.create(
            project=project,
            image=SimpleUploadedFile('delete-me.png', png_1x1, content_type='image/png'),
            order=0,
        )

        delete_url = reverse('project_image_delete', kwargs={'slug': project.slug, 'image_id': gallery_image.pk})
        response = self.client.post(delete_url, follow=True)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(ProjectImage.objects.filter(pk=gallery_image.pk).exists())

    def test_detail_renders_gallery_in_order(self):
        project = Project.objects.create(
            title='Gallery Detail',
            short_description='short',
            description='desc',
            category='personal',
        )

        try:
            from PIL import Image
            bio = BytesIO()
            Image.new('RGBA', (1, 1), (255, 0, 0, 0)).save(bio, format='PNG')
            png_1x1 = bio.getvalue()
        except Exception:
            png_1x1 = base64.b64decode(
                b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
            )

        second = ProjectImage.objects.create(
            project=project,
            title='Segunda',
            image=SimpleUploadedFile('second.png', png_1x1, content_type='image/png'),
            order=2,
        )
        first = ProjectImage.objects.create(
            project=project,
            title='Primera',
            image=SimpleUploadedFile('first.png', png_1x1, content_type='image/png'),
            order=1,
        )

        response = self.client.get(reverse('project_detail', kwargs={'slug': project.slug}))
        self.assertEqual(response.status_code, 200)

        content = response.content.decode()
        self.assertIn('Galería del proyecto', content)
        self.assertIn(first.image.url, content)
        self.assertIn(second.image.url, content)
        self.assertLess(content.index(first.image.url), content.index(second.image.url))
