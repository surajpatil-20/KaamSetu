from django.shortcuts import get_object_or_404

from django.db.models import Avg
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from works.models import Work
from .models import Review
from .serializers import ReviewSerializer
from notifications.utils import create_notification
from notifications.models import Notification
from django.db import transaction
from rest_framework.exceptions import ValidationError


class CreateReviewView(generics.CreateAPIView):

    serializer_class = ReviewSerializer

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def perform_create(self, serializer):

        work = get_object_or_404(
            Work,
            id=self.kwargs["work_id"],
            customer=self.request.user
        )

        if work.status != Work.Status.COMPLETED:

            raise ValidationError(
                "You can review the work only after it is completed."
            )

        if work.selected_worker is None:

            raise ValidationError(
                "This work does not have a selected worker."
            )

        if hasattr(work, "review"):

            raise ValidationError(
                "This work has already been reviewed."
            )

        review = serializer.save(
            work=work,
            customer=self.request.user,
            worker=work.selected_worker
        )

        create_notification(
            recipient=work.selected_worker,
            notification_type=(
                Notification.NotificationType.REVIEW_RECEIVED
            ),
            message=(
                f"You received a {review.rating}/5 review "
                f"for '{work.title}'."
            ),
            work=work
        )

class WorkerReviewListView(generics.GenericAPIView):

    serializer_class = ReviewSerializer
    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request, *args, **kwargs):

        worker_id = kwargs["worker_id"]

        reviews = Review.objects.filter(
            worker_id=worker_id
        ).select_related(
            "customer",
            "worker"
        ).order_by(
            "-created_at"
        )

        average_rating = reviews.aggregate(
            average=Avg("rating")
        )["average"]

        return Response({
            "worker": worker_id,
            "average_rating": (
                round(float(average_rating), 1)
                if average_rating is not None
                else 0
            ),
            "total_reviews": reviews.count(),
            "reviews": ReviewSerializer(
                reviews,
                many=True
            ).data
        })