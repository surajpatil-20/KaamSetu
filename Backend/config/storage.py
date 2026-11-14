from storages.backends.s3 import S3Storage


class SupabasePublicStorage(S3Storage):
    def url(self, name, parameters=None, expire=None, http_method=None):
        endpoint = (self.endpoint_url or "").rstrip("/")
        base_url = endpoint.replace(
            "/storage/v1/s3",
            "/storage/v1/object/public"
        )
        clean_name = str(name).lstrip("/")
        return f"{base_url}/{self.bucket_name}/{clean_name}"
