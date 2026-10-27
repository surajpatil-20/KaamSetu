import api from "./axios";

export const getMyWorks = async () => {
    const response = await api.get("/works/");
    return response.data;
};

export const createWork = async (data) => {
    const response = await api.post("/works/", data);
    return response.data;
};

export const getWork = async (id) => {
    const response = await api.get(`/works/${id}/`);
    return response.data;
};

export const updateWork = async (id, data) => {
    const response = await api.patch(`/works/${id}/`, data);
    return response.data;
};

export const deleteWork = async (id) => {
    const response = await api.delete(`/works/${id}/`);
    return response.data;
};

export const uploadWorkPhoto = async (workId, formData) => {
    const response = await api.post(
        `/works/${workId}/photos/`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};


export const getAvailableWorks = async (filters = {}) => {
    const response = await api.get("/works/available/", {
        params: filters,
    });

    return response.data;
};


export const getWorkerMyWorks = async () => {
    const response = await api.get("/works/my/");
    return response.data;
};

export const startWork = async (workId) => {
    const response = await api.post(`/works/${workId}/start/`);
    return response.data;
};

export const submitWork = async (workId) => {
    const response = await api.post(`/works/${workId}/submit/`);
    return response.data;
};