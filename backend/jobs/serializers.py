
from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):

    recruiter_username = serializers.ReadOnlyField(
        source='recruiter.username'
    )

    class Meta:
        model = Job
        fields = [
            'id',
            'recruiter',
            'recruiter_username',
            'title',
            'company',
            'location',
            'job_type',
            'salary',
            'min_salary',
            'max_salary',
            'description',
            'requirements',
            'application_deadline',
            'is_active',
            'created_at',
]
    
        read_only_fields = [
            'id',
            'recruiter',
            'recruiter_username',
            'created_at',
        ]

from .models import SavedJob







class SavedJobSerializer(serializers.ModelSerializer):
    job_title = serializers.ReadOnlyField(source='job.title')
    company = serializers.ReadOnlyField(source='job.company')
    location = serializers.ReadOnlyField(source='job.location')
    salary = serializers.ReadOnlyField(source='job.salary')
    job_type = serializers.ReadOnlyField(source='job.job_type')

    class Meta:
        model = SavedJob
        fields = [
            'id',
            'job',
            'job_title',
            'company',
            'location',
            'salary',
            'job_type',
            'saved_at',
        ]
        read_only_fields = ['id', 'saved_at']
