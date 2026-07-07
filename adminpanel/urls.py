from django.urls import path
from .views import (
    DashboardView,
    analytics_dashboard,
    contact_message_detail_view,
    contact_messages_view,
    mark_contact_message_read,
    mark_contact_message_replied,
    settings_view,
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('analytics/', analytics_dashboard, name='adminpanel_analytics'),
    path('settings/', settings_view, name='adminpanel_settings'),
    path('contact-messages/', contact_messages_view, name='adminpanel_contact_messages'),
    path('contact-messages/<int:pk>/', contact_message_detail_view, name='adminpanel_contact_message_detail'),
    path('contact-messages/<int:pk>/read/', mark_contact_message_read, name='adminpanel_contact_message_read'),
    path('contact-messages/<int:pk>/replied/', mark_contact_message_replied, name='adminpanel_contact_message_replied'),
]