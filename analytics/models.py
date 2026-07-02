from django.db import models


class PageView(models.Model):
    path = models.CharField(max_length=255, db_index=True)
    page_title = models.CharField(max_length=255, blank=True)
    method = models.CharField(max_length=10)
    referrer = models.CharField(max_length=500, blank=True)
    user_agent_hash = models.CharField(max_length=64)
    ip_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']


class ProjectView(models.Model):
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='analytics_views')
    ip_hash = models.CharField(max_length=64)
    user_agent_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
