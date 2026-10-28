
import os
from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings


def get_firebase_app():
    try:
        return firebase_admin.get_app()
    except ValueError:
        configured_path = os.environ.get(
            "FIREBASE_SERVICE_ACCOUNT_PATH",
            "firebase-service-account.json",
        )

        credential_path = Path(configured_path)

        if not credential_path.is_absolute():
            credential_path = Path(settings.BASE_DIR) / credential_path

        if not credential_path.is_file():
            raise RuntimeError(
                "Firebase service-account credentials were not found."
            )

        credential = credentials.Certificate(str(credential_path))

        return firebase_admin.initialize_app(credential)



def verify_firebase_phone_token(id_token):
    app = get_firebase_app()

    try:
        decoded_token = auth.verify_id_token(id_token, app=app)
    except (
        auth.InvalidIdTokenError,
        auth.ExpiredIdTokenError,
        auth.RevokedIdTokenError,
    ) as exc:
        raise ValueError("Invalid or expired Firebase ID token.") from exc

    phone_number = decoded_token.get("phone_number")

    if not phone_number:
        raise ValueError("The token has no verified phone number.")

    return phone_number

