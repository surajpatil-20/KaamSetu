import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


/*
|--------------------------------------------------------------------------
| Attach access token
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Let the browser set the multipart boundary for file uploads.
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => Promise.reject(error)
);


/*
|--------------------------------------------------------------------------
| Refresh access token when it expires
|--------------------------------------------------------------------------
*/

let isRefreshing = false;

let refreshSubscribers = [];


const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};


const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => {
        callback(newToken);
    });

    refreshSubscribers = [];
};


api.interceptors.response.use(
    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            originalRequest?._retry
        ) {
            return Promise.reject(error);
        }


        /*
        |--------------------------------------------------------------------------
        | Don't try to refresh the refresh endpoint itself
        |--------------------------------------------------------------------------
        */

        if (
            originalRequest.url?.includes("/auth/refresh/")
        ) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            return Promise.reject(error);
        }


        originalRequest._retry = true;


        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            localStorage.removeItem("accessToken");

            return Promise.reject(error);
        }


        /*
        |--------------------------------------------------------------------------
        | Another request is already refreshing
        |--------------------------------------------------------------------------
        */

        if (isRefreshing) {
            return new Promise((resolve) => {

                subscribeTokenRefresh((newToken) => {

                    originalRequest.headers.Authorization =
                        `Bearer ${newToken}`;

                    resolve(api(originalRequest));

                });

            });
        }


        isRefreshing = true;


        try {

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
                {
                    refresh: refreshToken,
                }
            );


            const newAccessToken = response.data.access;

            localStorage.setItem(
                "accessToken",
                newAccessToken
            );


            onRefreshed(newAccessToken);


            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;


            return api(originalRequest);

        } catch (refreshError) {

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            refreshSubscribers = [];

            return Promise.reject(refreshError);

        } finally {

            isRefreshing = false;

        }
    }
);


export default api;