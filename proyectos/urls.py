from django.urls import path
from . import views

app_name = 'proyectos'

urlpatterns = [
    path('', views.list_projects, name='list'),
    path('<int:pk>/', views.detail_project, name='detail'),
]
