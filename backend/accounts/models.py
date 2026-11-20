
from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):

    USER_TYPES = (
        ('job_seeker', 'Job Seeker'),
        ('recruiter', 'Recruiter'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPES
    )

    full_name = models.CharField(max_length=150, blank=True)
    profile_picture = models.ImageField(
    upload_to='profile_pictures/',
    blank=True,
    null=True
)

    company_name = models.CharField(max_length=200, blank=True)

    job_title = models.CharField(max_length=150, blank=True)

    website = models.URLField(blank=True)

    company_description = models.TextField(blank=True)

    company_logo = models.ImageField(
        upload_to='company_logos/',
        blank=True,
        null=True
    )

    phone = models.CharField(max_length=15, blank=True)

    address = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
