
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import transaction
from applications.models import Application

with transaction.atomic():
    keep_job2 = Application.objects.get(id=14)
    keep_job2.status = 'accepted'
    keep_job2.save(update_fields=['status'])

    Application.objects.filter(
        applicant_id=3,
        job_id=1
    ).exclude(id=9).delete()

    Application.objects.filter(
        applicant_id=3,
        job_id=2
    ).exclude(id=14).delete()

print("Duplicate applications cleaned successfully.")

for app in Application.objects.filter(
    applicant_id=3,
    job_id__in=[1, 2]
).order_by('id'):
    print(
        app.id,
        app.job_id,
        app.status,
        app.resume.name if app.resume else "No resume"
    )
