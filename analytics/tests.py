from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from django.urls import reverse

from analytics.models import PageView, ProjectView
from analytics.services import should_track_request, track_page_view
from projects.models import Project


class AnalyticsServicesTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_page_view_does_not_store_raw_ip(self):
        request = self.factory.get('/', HTTP_USER_AGENT='TestAgent', REMOTE_ADDR='1.2.3.4')
        request.user = AnonymousUser()

        track_page_view(request, page_title='home')

        view = PageView.objects.get()
        self.assertNotEqual(view.ip_hash, '1.2.3.4')
        self.assertEqual(len(view.ip_hash), 64)

    def test_should_track_request_ignores_static_adminpanel_api(self):
        for path in ['/static/x.css', '/adminpanel/dashboard/', '/api/projects/']:
            request = self.factory.get(path)
            request.user = AnonymousUser()
            self.assertFalse(should_track_request(request))

    def test_track_page_view_ignores_noise_and_static_paths(self):
        ignored_paths = [
            '/favicon.ico',
            '/static/app.css',
            '/media/test.jpg',
            '/api/projects/',
        ]

        for path in ignored_paths:
            request = self.factory.get(path)
            request.user = AnonymousUser()
            track_page_view(request)

        self.assertEqual(PageView.objects.count(), 0)

    def test_track_page_view_public_path_creates_record(self):
        request = self.factory.get('/projects/')
        request.user = AnonymousUser()

        track_page_view(request)

        self.assertEqual(PageView.objects.count(), 1)


class AnalyticsIntegrationTests(TestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.staff_user = self.user_model.objects.create_user(
            username='staffanalytics',
            email='staff.analytics@example.com',
            password='admin1234',
            is_staff=True,
        )
        self.project = Project.objects.create(
            title='Proyecto analytics',
            short_description='Descripcion corta analytics',
            description='Descripcion completa para pruebas de analytics en detalle de proyecto.',
            category='personal',
        )

    def test_get_public_creates_page_view(self):
        self.client.get(reverse('home'))
        self.assertEqual(PageView.objects.count(), 1)

    def test_staff_authenticated_does_not_create_page_view(self):
        self.client.login(username='staffanalytics', password='admin1234')
        self.client.get(reverse('home'))
        self.assertEqual(PageView.objects.count(), 0)

    def test_project_detail_creates_project_view(self):
        self.client.get(reverse('project_detail', kwargs={'slug': self.project.slug}))
        self.assertEqual(ProjectView.objects.count(), 1)

    def test_project_modal_creates_project_view(self):
        self.client.get(reverse('project_modal', kwargs={'slug': self.project.slug}))
        self.assertEqual(ProjectView.objects.count(), 1)

    def test_project_modal_staff_authenticated_does_not_create_project_view(self):
        self.client.login(username='staffanalytics', password='admin1234')
        self.client.get(reverse('project_modal', kwargs={'slug': self.project.slug}))
        self.assertEqual(ProjectView.objects.count(), 0)

    def test_adminpanel_analytics_requires_login_and_staff(self):
        response = self.client.get(reverse('adminpanel_analytics'))
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login/', response.url)

        self.client.login(username='staffanalytics', password='admin1234')
        response = self.client.get(reverse('adminpanel_analytics'))
        self.assertEqual(response.status_code, 200)

def test_robots_txt_is_not_tracked(self):
    self.client.get('/robots.txt')
    self.assertEqual(PageView.objects.count(), 0)


def test_known_bot_is_not_tracked(self):
    self.client.get(
        '/',
        HTTP_USER_AGENT='Mozilla/5.0 Googlebot/2.1'
    )
    self.assertEqual(PageView.objects.count(), 0)


def test_regular_browser_is_tracked(self):
    self.client.get(
        '/',
        HTTP_USER_AGENT=(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 Chrome/151.0 Safari/537.36'
        )
    )
    self.assertEqual(PageView.objects.count(), 1)
class AnalyticsFilteringTests(TestCase):
    def test_robots_txt_is_not_tracked(self):
        self.client.get('/robots.txt')
        self.assertEqual(PageView.objects.count(), 0)

    def test_known_bot_is_not_tracked(self):
        self.client.get(
            '/',
            HTTP_USER_AGENT='Mozilla/5.0 Googlebot/2.1'
        )
        self.assertEqual(PageView.objects.count(), 0)

    def test_regular_browser_is_tracked(self):
        self.client.get(
            '/',
            HTTP_USER_AGENT=(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 Chrome/151.0 Safari/537.36'
            )
        )
        self.assertEqual(PageView.objects.count(), 1)

class AnalyticsStatusCodeTests(TestCase):
    def test_404_is_not_tracked(self):
        response = self.client.get(
            '/ruta-que-no-existe-analytics-v2/',
            HTTP_USER_AGENT='Mozilla/5.0 Chrome/151.0'
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(PageView.objects.count(), 0)

class AnalyticsSessionTests(TestCase):
    def test_same_visitor_keeps_same_visitor_hash(self):
        self.client.get(
            '/',
            HTTP_USER_AGENT='Mozilla/5.0 Chrome/151.0',
            REMOTE_ADDR='10.0.0.1',
        )
        self.client.get(
            '/projects/',
            HTTP_USER_AGENT='Mozilla/5.0 Chrome/151.0',
            REMOTE_ADDR='10.0.0.1',
        )

        views = list(PageView.objects.order_by('created_at'))

        self.assertEqual(len(views), 2)
        self.assertEqual(
            views[0].visitor_hash,
            views[1].visitor_hash,
        )

    def test_same_visitor_within_timeout_keeps_same_session(self):
        self.client.get(
            '/',
            HTTP_USER_AGENT='Mozilla/5.0 Chrome/151.0',
            REMOTE_ADDR='10.0.0.2',
        )
        self.client.get(
            '/projects/',
            HTTP_USER_AGENT='Mozilla/5.0 Chrome/151.0',
            REMOTE_ADDR='10.0.0.2',
        )

        views = list(PageView.objects.order_by('created_at'))

        self.assertEqual(len(views), 2)
        self.assertEqual(
            views[0].session_hash,
            views[1].session_hash,
        )

    def test_different_visitors_get_different_visitor_hashes(self):
        self.client.get(
            '/',
            HTTP_USER_AGENT='Mozilla/5.0 Chrome/151.0',
            REMOTE_ADDR='10.0.0.3',
        )
        self.client.get(
            '/',
            HTTP_USER_AGENT='Mozilla/5.0 Firefox/141.0',
            REMOTE_ADDR='10.0.0.4',
        )

        views = list(PageView.objects.order_by('created_at'))

        self.assertEqual(len(views), 2)
        self.assertNotEqual(
            views[0].visitor_hash,
            views[1].visitor_hash,
        )

from datetime import timedelta
from unittest.mock import patch

from django.utils import timezone


class AnalyticsSessionTimeoutTests(TestCase):
    def test_session_expires_after_30_minutes(self):
        start = timezone.now()

        with patch('analytics.services.timezone.now', return_value=start):
            self.client.get(
                '/',
                HTTP_USER_AGENT='Mozilla/5.0 Chrome/151.0',
                REMOTE_ADDR='10.0.0.10',
            )

        with patch(
            'analytics.services.timezone.now',
            return_value=start + timedelta(minutes=31),
        ):
            self.client.get(
                '/projects/',
                HTTP_USER_AGENT='Mozilla/5.0 Chrome/151.0',
                REMOTE_ADDR='10.0.0.10',
            )

        views = list(PageView.objects.order_by('created_at'))

        self.assertEqual(len(views), 2)
        self.assertEqual(
            views[0].visitor_hash,
            views[1].visitor_hash,
        )
        self.assertNotEqual(
            views[0].session_hash,
            views[1].session_hash,
        )
