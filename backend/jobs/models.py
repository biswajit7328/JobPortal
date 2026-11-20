
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import User

class Job(models.Model):

    JOB_TYPES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('internship', 'Internship'),
        ('contract', 'Contract'),
    )

    recruiter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posted_jobs'
    )

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)

    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPES,
        default='full_time'
    )

    salary = models.CharField(max_length=100, blank=True)

    min_salary = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    max_salary = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    description = models.TextField()
    requirements = models.TextField(blank=True)

    application_deadline = models.DateField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class SavedJob(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='saved_jobs'
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='saved_by'
    )

    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'job'],
                name='unique_saved_job'
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.job.title}"
