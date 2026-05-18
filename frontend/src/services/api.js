import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export { BACKEND_URL };

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      if (window.location.pathname !== '/') {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;