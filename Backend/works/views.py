from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Work
from .permissions import IsCustomer , IsWorker
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .serializers import WorkSerializer, WorkPhotoSerializer
from django.shortcuts import get_object_or_404
from users.models import User
from notifications.utils import create_notification
from notifications.models import Notification
from django.db import transaction
from rest_framework.exceptions import (
    ValidationError,
    PermissionDenied
)

class WorkListCreateView(generics.ListCreateAPIView):

    serializer_class = WorkSerializer

    def get_permissions(self):

        if self.request.method == "POST":
            return [
                IsAuthenticated(),
                IsCustomer()
            ]

        return [
            IsAuthenticated()
        ]

    def get_queryset(self):

        user = self.request.user

        if user.role == User.Role.CUSTOMER:
            return Work.objects.filter(
                customer=user
            ).select_related(
                "customer",
                "selected_worker"
            ).order_by(
                "-created_at"
            )

        if user.role == User.Role.WORKER:
            return Work.objects.filter(
                status=Work.Status.OPEN,
                selected_worker__isnull=True
            ).select_related(
                "customer"
            ).order_by(
                "-created_at"
            )

        return Work.objects.none()

    def perform_create(self, serializer):

        serializer.save(
            customer=self.request.user
        )

class WorkDetailView(generics.RetrieveAPIView):

    serializer_class = WorkSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == User.Role.CUSTOMER:

            return Work.objects.filter(
                customer=user
            ).select_related(
                "customer",
                "selected_worker"
            )

        if user.role == User.Role.WORKER:

            return Work.objects.filter(
                selected_worker=user
            ).select_related(
                "customer",
                "selected_worker"
            ) | Work.objects.filter(
                status=Work.Status.OPEN,
                selected_worker__isnull=True
            ).select_related(
                "customer",
                "selected_worker"
            )

        return Work.objects.none()


class ManageWorkView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = WorkSerializer

    permission_classes = [
        IsAuthenticated,
        IsCustomer
    ]

    def get_queryset(self):

        return Work.objects.filter(
            customer=self.request.user
        )
    

class WorkPhotoCreateView(generics.CreateAPIView):

    serializer_class = WorkPhotoSerializer

    permission_classes = [
        IsAuthenticated,
        IsCustomer
    ]

    def perform_create(self, serializer):

        work_id = self.kwargs["work_id"]

        work = get_object_or_404(
            Work,
            id=work_id,
            customer=self.request.user
        )

        serializer.save(work=work)

class StartWorkView(generics.GenericAPIView):

    serializer_class = WorkSerializer

    permission_classes = [
        IsAuthenticated,
        IsWorker
    ]

    def post(self, request, *args, **kwargs):

        work = get_object_or_404(
            Work,
            id=kwargs["pk"],
            selected_worker=request.user
        )

        if work.status != Work.Status.WORKER_SELECTED:
            raise ValidationError(
                "This work cannot be started."
            )

        work.status = Work.Status.IN_PROGRESS

        work.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )

        return Response(
            WorkSerializer(work).data
        )

class SubmitWorkView(generics.GenericAPIView):

    serializer_class = WorkSerializer

    permission_classes = [
        IsAuthenticated,
        IsWorker
    ]
    @transaction.atomic
    def post(self, request, *args, **kwargs):

        work = get_object_or_404(
            Work,
            id=kwargs["pk"]
        )

        if work.selected_worker != request.user:
            raise PermissionDenied(
                "You are not the selected worker for this work."
            )

        if work.status != Work.Status.IN_PROGRESS:
            raise ValidationError(
                "This work cannot be submitted."
            )

        work.status = Work.Status.SUBMITTED

        work.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )
        create_notification(
            recipient=work.customer,
            notification_type=Notification.NotificationType.WORK_SUBMITTED,
            message=f"Your work '{work.title}' has been submitted by {request.user.username}.",
            work=work
        )

        return Response(
            WorkSerializer(work).data
        )

class ApproveWorkView(generics.GenericAPIView):

    serializer_class = WorkSerializer

    permission_classes = [
        IsAuthenticated,
        IsCustomer
    ]
    @transaction.atomic
    def post(self, request, *args, **kwargs):
    
        application = get_object_or_404(
            self.get_queryset(),
            id=kwargs["pk"],
            status=Application.Status.PENDING
        )
    
        work = (
            Work.objects
            .select_for_update()
            .get(id=application.work_id)
        )
    
        if work.status != Work.Status.OPEN:
            raise ValidationError(
                "A worker has already been selected for this work."
            )
    
        application.status = Application.Status.ACCEPTED
        application.save(update_fields=["status"])
    
        create_notification(
            recipient=application.worker,
            notification_type=Notification.NotificationType.WORKER_SELECTED,
            message=f"You have been selected for the work: {work.title}",
            work=work
        )
    
        other_applications = (
            Application.objects
            .filter(work=work)
            .exclude(id=application.id)
        )
    
        for other_application in other_applications:
        
            other_application.status = Application.Status.REJECTED
    
            other_application.save(
                update_fields=["status"]
            )
    
            create_notification(
                recipient=other_application.worker,
                notification_type=Notification.NotificationType.APPLICATION_REJECTED,
                message=(
                    f"Your application for "
                    f"'{work.title}' was not selected."
                ),
                work=work
            )
    
        work.selected_worker = application.worker
        work.status = Work.Status.WORKER_SELECTED
    
        work.save(
            update_fields=[
                "selected_worker",
                "status",
                "updated_at"
            ]
        )
    
        return Response(
            ApplicationSerializer(application).data
        )


class MyWorksView(generics.ListAPIView):

    serializer_class = WorkSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == User.Role.CUSTOMER:
            return Work.objects.filter(
                customer=user
            ).select_related(
                "customer",
                "selected_worker"
            ).order_by("-created_at")

        if user.role == User.Role.WORKER:
            return Work.objects.filter(
                selected_worker=user
            ).select_related(
                "customer",
                "selected_worker"
            ).order_by("-created_at")

        return Work.objects.none()

class AvailableWorksView(generics.ListAPIView):

    serializer_class = WorkSerializer

    permission_classes = [
        IsAuthenticated,
        IsWorker
    ]

    def get_queryset(self):

        return Work.objects.filter(
        status=Work.Status.OPEN,
        selected_worker__isnull=True
        ).select_related(
            "customer",
            "selected_worker"
        ).order_by(
            "-created_at"
        )