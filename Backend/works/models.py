from django.conf import settings
from django.db import models


class Work(models.Model):

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        WORKER_SELECTED = "WORKER_SELECTED", "Worker Selected"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        SUBMITTED = "SUBMITTED", "Submitted"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    class Category(models.TextChoices):
        PAINTING = "PAINTING", "Painting"
        PLUMBING = "PLUMBING", "Plumbing"
        ELECTRICAL = "ELECTRICAL", "Electrical"
        CLEANING = "CLEANING", "Cleaning"
        CARPENTRY = "CARPENTRY", "Carpentry"
        REPAIR = "REPAIR", "Repair"
        MOVING = "MOVING", "Moving"
        OTHER = "OTHER", "Other"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="works"
    )
    selected_worker = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    related_name="selected_works",
    null=True,
    blank=True
)

    title = models.CharField(max_length=200)

    description = models.TextField()

    category = models.CharField(
        max_length=30,
        choices=Category.choices
    )

    budget = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    location = models.CharField(max_length=255)

    work_date = models.DateField()

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.OPEN
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


    
class WorkPhoto(models.Model):

    work = models.ForeignKey(
        Work,
        on_delete=models.CASCADE,
        related_name="photos"
    )

    image = models.ImageField(
        upload_to="works/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Photo for {self.work.title}"