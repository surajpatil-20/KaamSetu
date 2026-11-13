from storages.backends.s3 import S3Storage


class SupabasePublicStorage(S3Storage):
    def url(self, name, parameters=None, expire=None, http_method=None):
        base_url = self.endpoint_url.replace(
            "/storage/v1/s3",
            "/storage/v1/object/public"
        )

        return f"{base_url}/{self.bucket_name}/{name}"