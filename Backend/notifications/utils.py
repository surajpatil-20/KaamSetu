from .models import Notification


def create_notification(
    recipient,
    notification_type,
    message,
    work=None
):
    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        message=message,
        work=work
    )