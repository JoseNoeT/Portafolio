from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),
    path('servicios/', views.services, name='services'),
    path('metodologia/', views.metodologia, name='metodologia'),
]
