import api from "./axios";

export const getWorkApplications = async (workId) => {
    const response = await api.get(`/applications/work/${workId}/`);
    return response.data;
};

export const selectWorker = async (applicationId) => {
    const response = await api.post(`/applications/${applicationId}/select/`);
    return response.data;
};

export const applyToWork = async (workId, data) => {
    const response = await api.post(`/applications/${workId}/`, data);
    return response.data;
};

export const getMyApplications = async () => {
    const response = await api.get("/applications/my/");
    return response.data;
};
