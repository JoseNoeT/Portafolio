from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from analytics.models import AnalyticsEvent, PageView, ProjectView
from core.models import SiteSettings
from projects.models import Project


@override_settings(ANALYTICS_ENABLED=True)
class AnalyticsReliabilityTests(TestCase):
    def setUp(self):
        self.project = Project.objects.create(
            title='Example', description='Existing functionality',
            github_url='https://github.com/example/project',
            live_url='https://example.com/demo',
        )
        self.staff = get_user_model().objects.create_user(
            username='analytics-review', is_staff=True,
        )

    def counts(self):
        return (PageView.objects.count(), ProjectView.objects.count(),
                AnalyticsEvent.objects.count())

    def submit_contact(self):
        return self.client.post(reverse('contact'), {
            'name': 'Example', 'email': 'example@example.com',
            'subject': 'Testing', 'message': 'A valid test message for the contact form.',
        })

    @override_settings(DEBUG=True, ANALYTICS_ENABLED=False)
    def test_disabled_collection_preserves_history_and_navigation(self):
        historical = PageView.objects.create(path='/historical/', method='GET')
        before = self.counts()
        self.assertEqual(self.client.get(reverse('home')).status_code, 200)
        self.client.get(reverse('project_modal', args=[self.project.slug]))
        response = self.client.get(reverse('analytics:outbound_event',
                                           args=['github_click', self.project.slug]))
        self.assertEqual(response.status_code, 302)
        settings = SiteSettings.get_solo()
        settings.contact_email = 'example@example.com'
        settings.save()
        response = self.client.get(reverse('analytics:contact_outbound_event',
                                           args=['email_click']))
        self.assertEqual(response.status_code, 302)
        self.submit_contact()
        self.assertEqual(self.counts(), before)
        historical.refresh_from_db()
        self.assertEqual(historical.path, '/historical/')

    @override_settings(DEBUG=False, SECURE_SSL_REDIRECT=False)
    def test_production_page_and_modal_interaction(self):
        self.client.get(reverse('home'))
        self.assertEqual(PageView.objects.count(), 1)
        self.client.get(reverse('project_modal', args=[self.project.slug]))
        self.assertEqual(PageView.objects.count(), 1)
        self.assertEqual(ProjectView.objects.count(), 1)

    def test_staff_excluded_from_all_collection(self):
        self.client.force_login(self.staff)
        self.client.get(reverse('home'))
        self.client.get(reverse('project_modal', args=[self.project.slug]))
        self.client.get(reverse('analytics:outbound_event',
                                args=['demo_click', self.project.slug]))
        self.submit_contact()
        self.assertEqual(self.counts(), (0, 0, 0))

    def test_real_events_redirect_and_sanitize_referrers(self):
        settings = SiteSettings.get_solo()
        settings.contact_email = 'example@example.com'
        settings.contact_phone = '123456789'
        settings.whatsapp_number = '123456789'
        settings.linkedin_url = 'https://linkedin.com/in/example'
        settings.save()
        self.client.get(reverse('home'),
                        HTTP_REFERER='https://user:secret@example.com/source?token=secret#private')
        self.assertEqual(PageView.objects.get().referrer, 'https://example.com/source')
        for event in ['github_click', 'demo_click']:
            response = self.client.get(reverse('analytics:outbound_event',
                                               args=[event, self.project.slug]),
                                       HTTP_REFERER='https://example.com/projects/?email=private#x')
            self.assertEqual(response.status_code, 302)
        for event in ['email_click', 'phone_click', 'whatsapp_click', 'linkedin_click']:
            response = self.client.get(reverse('analytics:contact_outbound_event', args=[event]))
            self.assertEqual(response.status_code, 302)
        self.submit_contact()
        self.assertEqual(AnalyticsEvent.objects.count(), 7)
        self.assertFalse(AnalyticsEvent.objects.filter(referrer__contains='?').exists())
        self.assertFalse(AnalyticsEvent.objects.filter(path__contains='?').exists())
        self.assertEqual(AnalyticsEvent.objects.filter(event_type='contact_submit').count(), 1)

    def test_dashboard_period_stable_grouping_and_history(self):
        twin = Project.objects.create(title=self.project.title, slug='distinct-project')
        old = timezone.now() - timedelta(days=8)
        past = PageView.objects.create(path='/old/', method='GET')
        PageView.objects.filter(pk=past.pk).update(created_at=old)
        PageView.objects.create(path='/recent/', method='GET',
                                visitor_hash='visitor', session_hash='session')
        PageView.objects.create(path='/projects/example/modal/', method='GET')
        previous = ProjectView.objects.create(project=self.project)
        ProjectView.objects.filter(pk=previous.pk).update(created_at=old)
        for project in [self.project, twin]:
            ProjectView.objects.create(project=project)
        event = AnalyticsEvent.objects.create(event_type='github_click')
        AnalyticsEvent.objects.filter(pk=event.pk).update(created_at=old)
        self.client.force_login(self.staff)
        before = self.counts()
        response = self.client.get(reverse('adminpanel_analytics'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['total_pageviews'], 1)
        self.assertEqual(response.context['total_sessions'], 1)
        self.assertEqual(response.context['total_conversions'], 0)
        self.assertEqual(response.context['top_pages'], [{'path': '/recent/', 'total': 1}])
        self.assertEqual(len(response.context['top_projects']), 2)
        self.assertEqual({r['project_id'] for r in response.context['top_projects']},
                         {self.project.pk, twin.pk})
        self.assertTrue(all(r['total'] == 1 for r in response.context['top_projects']))
        self.assertEqual(len(response.context['latest_visits']), 1)
        self.assertNotContains(response, 'Exploración alta')
        self.assertEqual(self.counts(), before)
        self.assertTrue(PageView.objects.filter(pk=past.pk).exists())
