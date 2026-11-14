from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Work
from .permissions import IsCustomer , IsWorker
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

import math


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
            ).prefetch_related(
                "photos"
            ).order_by(
                "-created_at"
            )

        if user.role == User.Role.WORKER:
            return Work.objects.filter(
                status=Work.Status.OPEN,
                selected_worker__isnull=True
            ).select_related(
                "customer"
            ).prefetch_related(
                "photos"
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
            ).prefetch_related(
                "photos"
            )

        if user.role == User.Role.WORKER:

            return Work.objects.filter(
                selected_worker=user
            ).select_related(
                "customer",
                "selected_worker"
            ).prefetch_related(
                "photos"
            ) | Work.objects.filter(
                status=Work.Status.OPEN,
                selected_worker__isnull=True
            ).select_related(
                "customer",
                "selected_worker"
            ).prefetch_related(
                "photos"
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
        ).prefetch_related("photos")
    

class WorkPhotoCreateView(generics.CreateAPIView):

    serializer_class = WorkPhotoSerializer

    permission_classes = [
        IsAuthenticated,
        IsCustomer,
    ]

    def get_work(self):
        if not hasattr(self, "_work"):
            work_id = self.kwargs["work_id"]
            work = get_object_or_404(Work, id=work_id)

            if work.customer != self.request.user:
                raise PermissionDenied(
                    "Only the customer who owns this work can upload photos."
                )

            self._work = work

        return self._work

    def create(self, request, *args, **kwargs):
        work = self.get_work()

        if work.photos.count() >= 3:
            raise ValidationError(
                {"detail": "A maximum of 3 photos per work is allowed."}
            )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        work = self.get_work()

        if work.photos.count() >= 3:
            raise ValidationError(
                {"detail": "A maximum of 3 photos per work is allowed."}
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
            ).prefetch_related(
                "photos"
            ).order_by("-created_at")

        if user.role == User.Role.WORKER:
            return Work.objects.filter(
                selected_worker=user
            ).select_related(
                "customer",
                "selected_worker"
            ).prefetch_related(
                "photos"
            ).order_by("-created_at")

        return Work.objects.none()


class AvailableWorksView(generics.ListAPIView):

    serializer_class = WorkSerializer

    permission_classes = [
        IsAuthenticated,
        IsWorker,
    ]

    def get_queryset(self):

        queryset = Work.objects.filter(
            status=Work.Status.OPEN,
            selected_worker__isnull=True,
        ).select_related(
            "customer",
            "selected_worker",
        ).prefetch_related(
            "photos"
        ).order_by(
            "-created_at"
        )

        params = self.request.query_params
        latitude = params.get("latitude")
        longitude = params.get("longitude")
        radius = params.get("radius", "10")

        # No coordinates supplied: return all open works.
        if latitude is None and longitude is None:
            return queryset

        # Both coordinates must be provided together.
        if latitude is None or longitude is None:
            raise ValidationError({
                "location": "Provide both latitude and longitude."
            })

        try:
            latitude = float(latitude)
            longitude = float(longitude)
            radius = float(radius)
        except (TypeError, ValueError):
            raise ValidationError({
                "location": "Coordinates and radius must be numbers."
            })

        if not -90 <= latitude <= 90:
            raise ValidationError({
                "latitude": "Latitude must be between -90 and 90."
            })

        if not -180 <= longitude <= 180:
            raise ValidationError({
                "longitude": "Longitude must be between -180 and 180."
            })

        if not 1 <= radius <= 100:
            raise ValidationError({
                "radius": "Radius must be between 1 and 100 km."
            })

        # Narrow down candidates using a bounding box.
        lat_delta = radius / 111.0
        min_lat = max(-90, latitude - lat_delta)
        max_lat = min(90, latitude + lat_delta)

        queryset = queryset.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            latitude__gte=min_lat,
            latitude__lte=max_lat,
        )

        # Longitude degrees vary with latitude.
        cos_lat = math.cos(math.radians(latitude))

        if abs(cos_lat) > 1e-8:
            lon_delta = min(
                180,
                radius / (111.0 * abs(cos_lat)),
            )

            if lon_delta < 180:
                min_lon = longitude - lon_delta
                max_lon = longitude + lon_delta

                if min_lon < -180:
                    queryset = queryset.filter(
                        longitude__gte=min_lon + 360
                    ) | queryset.filter(
                        longitude__lte=max_lon
                    )
                elif max_lon > 180:
                    queryset = queryset.filter(
                        longitude__gte=min_lon
                    ) | queryset.filter(
                        longitude__lte=max_lon - 360
                    )
                else:
                    queryset = queryset.filter(
                        longitude__gte=min_lon,
                        longitude__lte=max_lon,
                    )

        # Calculate exact straight-line distance (Haversine).
        nearby_works = []

        for work in queryset.distinct():

            work_lat = float(work.latitude)
            work_lon = float(work.longitude)

            lat1 = math.radians(latitude)
            lat2 = math.radians(work_lat)

            delta_lat = math.radians(work_lat - latitude)
            delta_lon = math.radians(work_lon - longitude)

            a = (
                math.sin(delta_lat / 2) ** 2
                + math.cos(lat1)
                * math.cos(lat2)
                * math.sin(delta_lon / 2) ** 2
            )

            a = max(0.0, min(1.0, a))

            distance_km = (
                6371 * 2 * math.asin(math.sqrt(a))
            )

            if distance_km <= radius:
                nearby_works.append((distance_km, work))

        # Closest work first.
        nearby_works.sort(key=lambda item: item[0])

        return [work for _, work in nearby_works]
