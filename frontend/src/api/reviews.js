
import api from "./axios";

export const createReview = async (workId, data) => {
    const response = await api.post(
        `/reviews/work/${workId}/`,
        data
    );

    return response.data;
};

export const getWorkerReviews = async (workerId) => {
    const response = await api.get(
        `/reviews/worker/${workerId}/`
    );

    return response.data;
};

export const getMyReviews = async () => {
    const response = await api.get("/reviews/my-reviews/");
    return response.data;
};
