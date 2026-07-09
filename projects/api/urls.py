from django.urls import path

from projects.api.views import ProjectDetailAPIView, ProjectListAPIView

urlpatterns = [
    path('', ProjectListAPIView.as_view(), name='api-project-list'),
    path('<slug:slug>/', ProjectDetailAPIView.as_view(), name='api-project-detail'),
]
