
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationStatusSerializer,
)


# Job seeker: Apply for a job and view own applications
class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            applicant=self.request.user
        ).order_by('-applied_at')

    def perform_create(self, serializer):
        user = self.request.user

        if user.profile.user_type != 'job_seeker':
            raise PermissionDenied(
                "Only job seekers can apply for jobs."
            )

        serializer.save(applicant=user)


# Job seeker: View a single application
class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            applicant=self.request.user
        )


# Recruiter: View applications for their own jobs
class RecruiterApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.profile.user_type != 'recruiter':
            raise PermissionDenied(
                "Only recruiters can view job applications."
            )

        return Application.objects.filter(
            job__recruiter=user
        ).order_by('-applied_at')


# Recruiter: Update application status only

class RecruiterApplicationStatusView(generics.UpdateAPIView):
    serializer_class = ApplicationStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['patch', 'options', 'head']

    def get_queryset(self):
        user = self.request.user

        if user.profile.user_type != 'recruiter':
            raise PermissionDenied(
                "Only recruiters can update application status."
            )

        return Application.objects.filter(
            job__recruiter=user
        )

    
    
    def perform_update(self, serializer):
        application = serializer.save()
        applicant = application.applicant

        if applicant.email:
            frontend_url = 'http://localhost:5173'

            application_url = f'{frontend_url}/#applications'

            status_messages = {
                'shortlisted': 'Congratulations! You have been shortlisted for this position.',
                'accepted': 'Congratulations! Your application has been accepted!',
                'rejected': 'Thank you for your interest. Unfortunately, your application was not selected.',
                'pending': 'Your application is currently under review.',
            }

            status_colors = {
                'shortlisted': '#16a34a',
                'accepted': '#2563eb',
                'rejected': '#dc2626',
                'pending': '#d97706',
            }

            current_status = application.status.lower()

            context = {
                'applicant_name': applicant.username,
                'job_title': application.job.title,
                'status': application.status,
                'status_message': status_messages.get(
                    current_status,
                    'Your application status has been updated.'
                ),
                'status_color': status_colors.get(
                    current_status,
                    '#2563eb'
                ),
                'application_url': application_url,
            }

            html_message = render_to_string(
                'applications/application_status_email.html',
                context
            )

            plain_message = (
                f'Hello {applicant.username},\n\n'
                f'{context["status_message"]}\n\n'
                f'Job: {application.job.title}\n'
                f'New Status: {application.status}\n\n'
                f'View your applications: {application_url}\n\n'
                f'Thank you for using JobPortal.'
            )

            email = EmailMultiAlternatives(
                subject='Job Application Status Update - JobPortal',
                body=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[applicant.email],
            )

            email.attach_alternative(html_message, 'text/html')
            email.send(fail_silently=True)
