from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from works.models import Work

from .models import Application
from .permissions import IsWorker ,IsCustomer

from .serializers import ApplicationSerializer
from django.db import transaction
from rest_framework.response import Response

from notifications.utils import create_notification
from notifications.models import Notification



class ApplicationCreateView(generics.CreateAPIView):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated,
        IsWorker
    ]
    @transaction.atomic
    def perform_create(self, serializer):
    
        work_id = self.kwargs["work_id"]
    
        work = get_object_or_404(
            Work.objects.select_for_update(),
            id=work_id
        )
    
        if work.customer == self.request.user:
        
            raise ValidationError(
                "You cannot apply to your own work."
            )
    
        if (
            work.status != Work.Status.OPEN
            or work.selected_worker is not None
        ):
    
            raise ValidationError(
                "This work is no longer available for applications."
            )
    
        already_applied = Application.objects.filter(
            work=work,
            worker=self.request.user
        ).exists()
    
        if already_applied:
        
            raise ValidationError(
                "You have already applied to this work."
            )
    
        application = serializer.save(
            work=work,
            worker=self.request.user
        )

        create_notification(
            recipient=work.customer,
            notification_type=Notification.NotificationType.APPLICATION_RECEIVED,
            message=f"{self.request.user.username} applied for your work: {work.title}",
            work=work
        )

class WorkApplicationsView(generics.ListAPIView):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated,
        IsCustomer
    ]

    def get_queryset(self):

        work_id = self.kwargs["work_id"]

        work = get_object_or_404(
            Work,
            id=work_id,
            customer=self.request.user
        )

        return Application.objects.filter(
            work=work
        ).order_by("-applied_at")


class SelectWorkerView(generics.GenericAPIView):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated,
        IsCustomer
    ]

    def get_queryset(self):

        return Application.objects.filter(
            work__customer=self.request.user
        )

    @transaction.atomic
    def post(self, request, *args, **kwargs):

        application = get_object_or_404(
            self.get_queryset(),
            id=kwargs["pk"],
            status=Application.Status.PENDING
        )

        work = application.work

        if work.status != Work.Status.OPEN:
            raise ValidationError(
                "A worker has already been selected for this work."
            )

        # Accept selected application
        application.status = Application.Status.ACCEPTED
        application.save(
            update_fields=["status"]
        )

        create_notification(
            recipient=application.worker,
            notification_type=Notification.NotificationType.WORKER_SELECTED,
            message=f"You have been selected for the work: {work.title}",
            work=work
        )

        other_applications = Application.objects.filter(
            work=work
        ).exclude(
            id=application.id
        )
        
        for other_application in other_applications:
        
            other_application.status = Application.Status.REJECTED
        
            other_application.save(
                update_fields=["status"]
            )
        
            create_notification(
                recipient=other_application.worker,
                notification_type=Notification.NotificationType.APPLICATION_REJECTED,
                message=f"Your application for '{work.title}' was not selected.",
                work=work
            )

        # Update work status
        work.selected_worker = application.worker
        work.status = Work.Status.WORKER_SELECTED
        
        work.save(
            update_fields=[
                "selected_worker",
                "status"
            ]
        )

        return Response(
            ApplicationSerializer(application).data
        )