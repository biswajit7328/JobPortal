
from rest_framework import serializers
from django.utils import timezone

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):

    applicant_username = serializers.ReadOnlyField(
        source='applicant.username'
    )

    job_title = serializers.ReadOnlyField(source='job.title')
    company = serializers.ReadOnlyField(source='job.company')

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'job_title',
            'company',
            'applicant',
            'applicant_username',
            'resume',
            'cover_letter',
            'status',
            'applied_at',
        ]

        read_only_fields = [
            'id',
            'applicant',
            'applicant_username',
            'status',
            'applied_at',
        ]

    def validate(self, attrs):
        user = self.context['request'].user
        job = attrs.get('job')

        # Check whether the job is active
        if not job.is_active:
            raise serializers.ValidationError({
                "detail": "This job is no longer accepting applications."
            })

        # Check whether the application deadline has passed
        if (
            job.application_deadline
            and job.application_deadline < timezone.localdate()
        ):
            raise serializers.ValidationError({
                "detail": "The application deadline for this job has passed."
            })

        # Prevent duplicate applications
        if Application.objects.filter(
            applicant=user,
            job=job
        ).exists():
            raise serializers.ValidationError({
                "detail": "You have already applied for this job."
            })

        return attrs

    def validate_resume(self, file):
        if file:
            extension = file.name.lower().rsplit('.', 1)[-1]

            if extension not in ['pdf', 'docx']:
                raise serializers.ValidationError(
                    "Only PDF and DOCX files are allowed."
                )

            if file.size > 5 * 1024 * 1024:
                raise serializers.ValidationError(
                    "Resume size must not exceed 5 MB."
                )

        return file


class ApplicationStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Application
        fields = ['id', 'status']
        read_only_fields = ['id']
