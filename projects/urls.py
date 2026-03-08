from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_projects, name='projects_list'),
    path('create/', views.create_project, name='project_create'),
    path('<slug:slug>/edit/', views.edit_project, name='project_edit'),
    path('<slug:slug>/delete/', views.delete_project, name='project_delete'),
    path('<slug:slug>/', views.project_detail, name='project_detail'),
]