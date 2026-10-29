
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

function getCookie(name) {
    const prefix = `${name}=`;
    const cookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith(prefix));

    return cookie
        ? decodeURIComponent(cookie.substring(prefix.length))
        : null;
}

let csrfRequest = null;

async function ensureCsrfCookie() {
    if (getCookie("csrftoken")) {
        return;
    }

    if (!csrfRequest) {
        csrfRequest = api
            .get("/auth/csrf/")
            .finally(() => {
                csrfRequest = null;
            });
    }

    await csrfRequest;
}

const unsafeMethods = ["post", "put", "patch", "delete"];

api.interceptors.request.use(async (config) => {
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }

    if (unsafeMethods.includes(config.method?.toLowerCase())) {
        await ensureCsrfCookie();

        const csrfToken = getCookie("csrftoken");

        if (csrfToken) {
            config.headers["X-CSRFToken"] = csrfToken;
        }
    }

    return config;
});

let refreshPromise = null;

// These endpoints must work without an existing login session.
const noRefreshUrls = [
    "/auth/login/",
    "/auth/register/",
    "/auth/refresh/",
    "/auth/logout/",
    "/auth/csrf/",
    "/auth/verify-phone/",
    "/auth/forgot-password/",
    "/auth/verify-otp/",
    "/auth/reset-password/",
    "/auth/resend-phone-otp/",
    "/auth/resend-password-otp/",
];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry
        ) {
            return Promise.reject(error);
        }

        const url = originalRequest.url || "";

        // Never refresh tokens for public authentication endpoints.
        if (noRefreshUrls.some((endpoint) => url.includes(endpoint))) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = api
                    .post("/auth/refresh/")
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            await refreshPromise;

            // Retry the original request after refreshing the access cookie.
            return api(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
);

export default api;
