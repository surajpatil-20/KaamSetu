from rest_framework.permissions import BasePermission
from users.models import User


class IsWorker(BasePermission):

    message = "Only workers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.WORKER
        )


class IsCustomer(BasePermission):

    message = "Only customers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.CUSTOMER
        )