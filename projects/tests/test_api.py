from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import Project


class ProjectPublicApiTests(APITestCase):
    def setUp(self):
        self.project = Project.objects.create(
            title='API Project',
            short_description='Project for API tests',
            description='Detailed API project description',
            category='professional',
            technologies='Django,DRF,PostgreSQL',
            github_url='https://github.com/example/repo',
            live_url='https://example.com',
        )

    def test_project_list_responds_200(self):
        url = reverse('api-project-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_project_list_returns_json(self):
        url = reverse('api-project-list')
        response = self.client.get(url)

        self.assertIn('application/json', response['Content-Type'])

    def test_project_detail_responds_200(self):
        url = reverse('api-project-detail', kwargs={'slug': self.project.slug})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_project_detail_missing_returns_404(self):
        url = reverse('api-project-detail', kwargs={'slug': 'no-existe'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_project_detail_contains_expected_fields(self):
        url = reverse('api-project-detail', kwargs={'slug': self.project.slug})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_fields = {
            'id',
            'title',
            'slug',
            'short_description',
            'description',
            'category',
            'technologies',
            'tech_list',
            'github_url',
            'live_url',
            'image_url',
            'created_at',
            'updated_at',
        }
        self.assertTrue(expected_fields.issubset(set(response.data.keys())))
