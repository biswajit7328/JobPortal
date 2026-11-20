
from django.db.models import Q
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
    BasePermission,
)


from .models import Job, SavedJob
from .serializers import JobSerializer, SavedJobSerializer
from rest_framework.exceptions import PermissionDenied

# Custom permission: Only recruiters can create jobs
class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return request.user.profile.user_type == 'recruiter'


# Custom pagination: Show 5 jobs per page
class JobPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 20


# List active jobs and create a new job
class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    pagination_class = JobPagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsRecruiter()]

        return [IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        queryset = Job.objects.filter(
            is_active=True
        )

        # Search by job title or company
        search = self.request.query_params.get('search')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(company__icontains=search)
            )

        # Filter by location
        location = self.request.query_params.get('location')

        if location:
            queryset = queryset.filter(
                location__icontains=location
            )

        # Filter by job type
        job_type = self.request.query_params.get('job_type')

        if job_type:
            queryset = queryset.filter(
                job_type=job_type
            )

        # Filter by minimum salary
        min_salary = self.request.query_params.get('min_salary')

        if min_salary:
            queryset = queryset.filter(
                max_salary__gte=min_salary
            )

        # Filter by maximum salary
        max_salary = self.request.query_params.get('max_salary')

        if max_salary:
            queryset = queryset.filter(
                min_salary__lte=max_salary
            )

        # Sort jobs
        sort_by = self.request.query_params.get(
            'sort_by',
            'newest'
        )

        if sort_by == 'newest':
            queryset = queryset.order_by('-created_at')

        elif sort_by == 'oldest':
            queryset = queryset.order_by('created_at')

        elif sort_by == 'salary_low':
            queryset = queryset.order_by(
                'min_salary',
                '-created_at'
            )

        elif sort_by == 'salary_high':
            queryset = queryset.order_by(
                '-max_salary',
                '-created_at'
            )

        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)


# View, update and delete a single job

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.profile.user_type != 'recruiter':
            return Job.objects.none()

        return Job.objects.filter(recruiter=user)
# Recruiter: View only their own posted jobs
class RecruiterJobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsRecruiter]

    def get_queryset(self):
        return Job.objects.filter(
            recruiter=self.request.user
        ).order_by('-created_at')





# Job seeker: Save a job and view saved jobs
class SavedJobListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.profile.user_type != 'job_seeker':
            return SavedJob.objects.none()

        return SavedJob.objects.filter(
            user=user
        ).order_by('-saved_at')

    def perform_create(self, serializer):
        user = self.request.user

        if user.profile.user_type != 'job_seeker':
            raise PermissionDenied(
                "Only job seekers can save jobs."
            )

        job = serializer.validated_data['job']

        if not job.is_active:
            raise PermissionDenied(
                "You cannot save an inactive job."
            )

        if SavedJob.objects.filter(user=user, job=job).exists():
            raise PermissionDenied(
                "You have already saved this job."
            )

        serializer.save(user=user)


# Job seeker: Remove a saved job
class SavedJobDeleteView(generics.DestroyAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.profile.user_type != 'job_seeker':
            return SavedJob.objects.none()

        return SavedJob.objects.filter(user=user)
