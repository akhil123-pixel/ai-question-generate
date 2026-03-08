import axios from "axios";

const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
};

export const resumeService = {
  upload: (formData) => api.post("/resume/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
};

export const questionService = {
  save: (data) => api.post("/questions/save", data),
};

export const historyService = {
  getAll: () => api.get("/history"),
  getById: (id) => api.get(`/history/${id}`),
  delete: (id) => {
    console.log(`API CALL: DELETE /history/${id}`);
    return api.delete(`/history/${id}`);
  },
};

export default api;
