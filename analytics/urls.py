from django.urls import path

from . import views


app_name = 'analytics'


urlpatterns = [
    path(
        'out/<str:event_type>/<slug:slug>/',
        views.outbound_event,
        name='outbound_event',
    ),
]
