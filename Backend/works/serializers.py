
from rest_framework import serializers

from .models import Work, WorkPhoto


class WorkPhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkPhoto
        fields = [
            "id",
            "image",
            "uploaded_at",
        ]

        read_only_fields = [
            "id",
            "uploaded_at",
        ]


class WorkSerializer(serializers.ModelSerializer):

    customer = serializers.ReadOnlyField(
        source="customer.username"
    )

    selected_worker = serializers.ReadOnlyField(
        source="selected_worker.username"
    )

    contact_details = serializers.SerializerMethodField()

    photos = WorkPhotoSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Work

        fields = [
            "id",
            "customer",
            "selected_worker",
            "contact_details",
            "title",
            "description",
            "category",
            "budget",
            "location",
            "address",
            "city",
            "pincode",
            "latitude",
            "longitude",
            "work_date",
            "status",
            "photos",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "customer",
            "selected_worker",
            "contact_details",
            "status",
            "photos",
            "created_at",
            "updated_at",
        ]

    def validate_pincode(self, value):
        value = value.strip()

        if value and (
            len(value) != 6 or not value.isdigit()
        ):
            raise serializers.ValidationError(
                "Enter a valid 6-digit Indian PIN code."
            )

        return value

    def validate(self, attrs):
        latitude = attrs.get(
            "latitude",
            getattr(self.instance, "latitude", None)
        )
        longitude = attrs.get(
            "longitude",
            getattr(self.instance, "longitude", None)
        )

        if (latitude is None) != (longitude is None):
            raise serializers.ValidationError({
                "latitude": (
                    "Latitude and longitude must be provided together."
                ),
                "longitude": (
                    "Latitude and longitude must be provided together."
                ),
            })

        if latitude is not None and not -90 <= latitude <= 90:
            raise serializers.ValidationError({
                "latitude": "Latitude must be between -90 and 90."
            })

        if longitude is not None and not -180 <= longitude <= 180:
            raise serializers.ValidationError({
                "longitude": "Longitude must be between -180 and 180."
            })

        return attrs

    def get_contact_details(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return None

        user = request.user

        # Contact details are available only after selection.
        if (
            obj.status not in [
                Work.Status.WORKER_SELECTED,
                Work.Status.IN_PROGRESS,
                Work.Status.SUBMITTED,
                Work.Status.COMPLETED,
            ]
            or not obj.selected_worker_id
        ):
            return None

        # The customer can see the selected worker's details.
        if obj.customer_id == user.id:
            contact_user = obj.selected_worker

            try:
                profile = contact_user.worker_profile
                phone = profile.phone or contact_user.phone_number
                photo = profile.profile_photo
            except Exception:
                phone = contact_user.phone_number
                photo = None

            return {
                "name": contact_user.username,
                "role": "WORKER",
                "phone": phone or None,
                "profile_photo": (
                    request.build_absolute_uri(photo.url)
                    if photo and photo.name
                    else None
                ),
            }

        # The selected worker can see the customer's details.
        if obj.selected_worker_id == user.id:
            contact_user = obj.customer

            try:
                profile = contact_user.customer_profile
                phone = profile.phone or contact_user.phone_number
                photo = profile.profile_photo
            except Exception:
                phone = contact_user.phone_number
                photo = None

            return {
                "name": contact_user.username,
                "role": "CUSTOMER",
                "phone": phone or None,
                "profile_photo": (
                    request.build_absolute_uri(photo.url)
                    if photo and photo.name
                    else None
                ),
            }

        return None
