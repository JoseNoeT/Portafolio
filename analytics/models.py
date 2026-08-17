from django.db import models


class PageView(models.Model):
    path = models.CharField(max_length=255, db_index=True)
    page_title = models.CharField(max_length=255, blank=True)
    method = models.CharField(max_length=10)
    referrer = models.CharField(max_length=500, blank=True)
    user_agent_hash = models.CharField(max_length=64)
    ip_hash = models.CharField(max_length=64)
    visitor_hash = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
    )
    session_hash = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']


class ProjectView(models.Model):
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='analytics_views',
    )
    ip_hash = models.CharField(max_length=64)
    user_agent_hash = models.CharField(max_length=64)
    visitor_hash = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
    )
    session_hash = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']


class AnalyticsEvent(models.Model):
    EVENT_TYPES = [
        ('github_click', 'GitHub click'),
        ('demo_click', 'Demo click'),
        ('contact_click', 'Contact click'),
        ('email_click', 'Email click'),
        ('phone_click', 'Phone click'),
        ('linkedin_click', 'LinkedIn click'),
        ('whatsapp_click', 'WhatsApp click'),
        ('cv_download', 'CV download'),
        ('contact_submit', 'Contact submit'),
    ]

    event_type = models.CharField(
        max_length=50,
        choices=EVENT_TYPES,
        db_index=True,
    )
    path = models.CharField(max_length=255, blank=True)
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='analytics_events',
    )
    referrer = models.CharField(max_length=500, blank=True)
    ip_hash = models.CharField(max_length=64)
    user_agent_hash = models.CharField(max_length=64)
    visitor_hash = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
    )
    session_hash = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
