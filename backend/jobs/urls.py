from django.urls import path

from .views import (
    JobListCreateView,
    JobDetailView,
    RecruiterJobListView,
    SavedJobListCreateView,
    SavedJobDeleteView,
)

urlpatterns = [
    path('', JobListCreateView.as_view(), name='job-list-create'),

    path('recruiter/', RecruiterJobListView.as_view(), name='recruiter-job-list'),

    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),

    path('saved/', SavedJobListCreateView.as_view(), name='saved-job-list-create'),

    path('saved/<int:pk>/', SavedJobDeleteView.as_view(), name='saved-job-delete'),
]