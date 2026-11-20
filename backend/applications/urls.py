
from django.urls import path

from .views import (
    ApplicationListCreateView,
    ApplicationDetailView,
    RecruiterApplicationListView,
    RecruiterApplicationStatusView,
)

urlpatterns = [
    # Job seeker APIs
    path('', ApplicationListCreateView.as_view(), name='application-list-create'),
    path('<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),

    # Recruiter APIs
    path(
        'recruiter/',
        RecruiterApplicationListView.as_view(),
        name='recruiter-applications'
    ),
    path(
        'recruiter/<int:pk>/status/',
        RecruiterApplicationStatusView.as_view(),
        name='recruiter-application-status'
    ),
]
