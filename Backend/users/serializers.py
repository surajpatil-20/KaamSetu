from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import WorkerProfile
from django.db.models import Avg

User = get_user_model()


from django.contrib.auth.password_validation import validate_password

from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "phone_number",
            "role",
        ]

    def validate_phone_number(self, value):

        value = value.strip()

        if value.startswith("+91"):
            number = value[3:]
        else:
            number = value

        number = number.replace(" ", "").replace("-", "")

        if not number.isdigit() or len(number) != 10:
            raise serializers.ValidationError(
                "Enter a valid 10-digit Indian mobile number."
            )

        normalized = "+91" + number

        if User.objects.filter(
            phone_number=normalized
        ).exists():
            raise serializers.ValidationError(
                "This mobile number is already registered."
            )

        return normalized

    def create(self, validated_data):

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        return user


class WorkerProfileSerializer(serializers.ModelSerializer):

    username = serializers.ReadOnlyField(
        source="user.username"
    )

    average_rating = serializers.SerializerMethodField()

    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = WorkerProfile
        fields = [
            "username",
            "profile_photo",
            "bio",
            "skills",
            "experience",
            "hourly_rate",
            "average_rating",
            "total_reviews",
        ]

    def get_average_rating(self, obj):

        average = obj.user.received_reviews.aggregate(
            average=Avg("rating")
        )["average"]

        if average is None:
            return 0

        return round(float(average), 1)

    def get_total_reviews(self, obj):

        return obj.user.received_reviews.count()

class ForgotPasswordSerializer(serializers.Serializer):

    identifier = serializers.CharField(
        max_length=150
    )

class VerifyOTPSerializer(serializers.Serializer):

    identifier = serializers.CharField(
        max_length=150
    )

    otp = serializers.CharField(
        min_length=6,
        max_length=6
    )

class ResetPasswordSerializer(serializers.Serializer):

    uid = serializers.IntegerField()

    token = serializers.CharField()

    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return attrs