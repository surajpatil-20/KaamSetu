from django.contrib.auth.models import AbstractUser
from django.db import models


from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        CUSTOMER = "CUSTOMER", "Customer"
        WORKER = "WORKER", "Worker"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER
    )

    phone_number = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True
    )

    phone_verified = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.username

class PasswordResetOTP(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="password_reset_otps"
    )

    otp_hash = models.CharField(
        max_length=128
    )

    expires_at = models.DateTimeField()

    attempts = models.PositiveSmallIntegerField(
        default=0
    )

    is_used = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        indexes = [
            models.Index(
                fields=["user", "created_at"]
            ),
            models.Index(
                fields=["expires_at"]
            ),
        ]

    def __str__(self):
        return f"Password reset OTP - {self.user.username}"

class CustomerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="customer_profile"
    )

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    profile_photo = models.ImageField(
        upload_to="customers/",
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.user.username} - Customer"


class WorkerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="worker_profile"
    )

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    profile_photo = models.ImageField(
        upload_to="workers/",
        blank=True,
        null=True
    )

    bio = models.TextField(
        blank=True
    )

    skills = models.TextField(
        blank=True
    )

    experience = models.PositiveIntegerField(
        default=0
    )

    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.user.username} - Worker"
