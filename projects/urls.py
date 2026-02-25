from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_projects, name='projects_list'),
    path('<slug:slug>/', views.project_detail, name='project_detail'),
]