import api from "./axios";

export const registerUser = async (data) => {
    const response = await api.post(
        "/auth/register/",
        data
    );

    return response.data;
};

export const loginUser = async (data) => {
    const response = await api.post(
        "/auth/login/",
        data
    );

    return response.data;
};

export const verifyPhone = async (data) => {
    const response = await api.post(
        "/auth/verify-phone/",
        data
    );

    return response.data;
};

export const forgotPassword = async (data) => {
    const response = await api.post(
        "/auth/forgot-password/",
        data
    );

    return response.data;
};

export const verifyResetOTP = async (data) => {
    const response = await api.post(
        "/auth/verify-otp/",
        data
    );

    return response.data;
};

export const resetPassword = async (data) => {
    const response = await api.post(
        "/auth/reset-password/",
        data
    );

    return response.data;
};

export const refreshToken = async (data) => {
    const response = await api.post(
        "/auth/refresh/",
        data
    );

    return response.data;
};

export const getProfile = async () => {
    const response = await api.get("/auth/profile/");
    return response.data;
};

export const resendPhoneOTP = async (data) => {
    const response = await api.post(
        "/auth/resend-phone-otp/",
        data
    );

    return response.data;
};

export const resendPasswordOTP = async (data) => {

    const response = await api.post(
        "/auth/resend-password-otp/",
        data
    );

    return response.data;
};