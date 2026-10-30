from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from users.models import User


class Command(BaseCommand):
    help = "Delete unverified user accounts older than 24 hours."

    def handle(self, *args, **options):
        expiry_time = timezone.now() - timedelta(hours=24)

        expired_users = User.objects.filter(
            phone_verified=False,
            date_joined__lte=expiry_time,
            is_superuser=False,
            is_staff=False,
        )

        deleted_count, _ = expired_users.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Cleanup completed. Deleted {deleted_count} database records."
            )
        )