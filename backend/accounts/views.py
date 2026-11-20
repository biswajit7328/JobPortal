from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .permissions import IsAdminUser
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import UserProfile
from jobs.models import Job
from applications.models import Application

from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    AdminTokenObtainPairSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user.profile


class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer
    permission_classes = [AllowAny]

    
class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()

        total_recruiters = UserProfile.objects.filter(
            user_type='recruiter'
        ).count()

        total_job_seekers = UserProfile.objects.filter(
            user_type='job_seeker'
        ).count()

        total_jobs = Job.objects.count()

        active_jobs = Job.objects.filter(
            is_active=True
        ).count()

        total_applications = Application.objects.count()

        pending_applications = Application.objects.filter(
            status='pending'
        ).count()

        return Response({
            'total_users': total_users,
            'total_recruiters': total_recruiters,
            'total_job_seekers': total_job_seekers,
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_applications': total_applications,
            'pending_applications': pending_applications,
        })
class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.select_related('profile').all().order_by('-date_joined')

        user_list = []

        for user in users:
            profile = getattr(user, 'profile', None)

            user_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': profile.user_type if profile else 'unknown',
                'is_active': user.is_active,
                'date_joined': user.date_joined,
            })

        return Response(user_list)
    
    def post(self, request):
        user_id = request.data.get('user_id')
        is_active = request.data.get('is_active')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=404
            )

        if not isinstance(is_active, bool):
            return Response(
                {'error': 'is_active must be true or false'},
                status=400
            )

        user.is_active = is_active
        user.save(update_fields=['is_active'])

        return Response({
            'message': 'User status updated successfully',
            'user_id': user.id,
            'is_active': user.is_active
        })
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {'error': 'Email is required'},
                status=400
            )

        user = User.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = (
                f'http://localhost:5173/reset-password/{uid}/{token}'
            )

            send_mail(
                'Job Portal Password Reset',
                f'Click this link to reset your password: {reset_link}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )

        return Response({
            'message': 'If the email is registered, a password reset link will be sent.'
        })


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uid or not token or not new_password:
            return Response(
                {'error': 'All fields are required'},
                status=400
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (ValueError, TypeError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Invalid reset link'},
                status=400
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Invalid or expired reset link'},
                status=400
            )

        try:
            validate_password(new_password, user)
        except ValidationError as error:
            return Response(
                {'error': error.messages},
                status=400
            )

        user.set_password(new_password)
        user.save()

        return Response({
            'message': 'Password reset successfully'
        })