from rest_framework import serializers

from users.serializers import WorkerProfileSerializer

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):

    worker = WorkerProfileSerializer(
        source="worker.worker_profile",
        read_only=True
    )

    work = serializers.ReadOnlyField(
        source="work.id"
    )

    class Meta:
        model = Application

        fields = [
            "id",
            "work",
            "worker",
            "proposed_price",
            "message",
            "status",
            "applied_at",
        ]

        read_only_fields = [
            "id",
            "work",
            "worker",
            "status",
            "applied_at",
        ]