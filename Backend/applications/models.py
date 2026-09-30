from django.conf import settings
from django.db import models


class Application(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    work = models.ForeignKey(
        "works.Work",
        on_delete=models.CASCADE,
        related_name="applications"
    )

    worker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    proposed_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    message = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    applied_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["work", "worker"],
                name="unique_worker_work_application"
            )
        ]

    def __str__(self):
        return f"{self.worker.username} → {self.work.title}"