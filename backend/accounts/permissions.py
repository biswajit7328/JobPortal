
from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Allow access only to Django superusers who are staff members.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
            and request.user.is_superuser
        )
