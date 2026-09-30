# Backend/reviews/models.py

from django.conf import settings
from django.db import models


class Review(models.Model):

    work = models.OneToOneField(
        "works.Work",
        on_delete=models.CASCADE,
        related_name="review"
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="given_reviews"
    )

    worker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_reviews"
    )

    rating = models.PositiveSmallIntegerField()

    comment = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.customer.username} → {self.worker.username} ({self.rating}/5)"