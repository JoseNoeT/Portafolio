from django.test import TestCase

from projects.models import Project


class ProjectSlugTests(TestCase):
    def create_project(self, title):
        return Project.objects.create(
            title=title,
            short_description='Short description',
            description='Long description',
            category='personal',
        )

    def test_duplicate_titles_get_incremental_slugs(self):
        p1 = self.create_project('Mi Proyecto')
        p2 = self.create_project('Mi Proyecto')
        p3 = self.create_project('Mi Proyecto')

        self.assertEqual(p1.slug, 'mi-proyecto')
        self.assertEqual(p2.slug, 'mi-proyecto-2')
        self.assertEqual(p3.slug, 'mi-proyecto-3')

    def test_slug_generation_ignores_current_instance_on_update(self):
        project = self.create_project('Proyecto Unico')
        original_slug = project.slug

        project.short_description = 'Updated description'
        project.save()

        self.assertEqual(project.slug, original_slug)
