from django.conf import settings
from django.db import models


class Notification(models.Model):

    class NotificationType(models.TextChoices):
        APPLICATION_RECEIVED = (
            "APPLICATION_RECEIVED",
            "Application Received"
        )

        WORKER_SELECTED = (
            "WORKER_SELECTED",
            "Worker Selected"
        )

        APPLICATION_REJECTED = (
            "APPLICATION_REJECTED",
            "Application Rejected"
        )

        WORK_SUBMITTED = (
            "WORK_SUBMITTED",
            "Work Submitted"
        )

        WORK_COMPLETED = (
            "WORK_COMPLETED",
            "Work Completed"
        )

        REVIEW_RECEIVED = (
            "REVIEW_RECEIVED",
            "Review Received"
        )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices
    )

    message = models.CharField(
        max_length=255
    )

    work = models.ForeignKey(
        "works.Work",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.recipient.username} - {self.message}"