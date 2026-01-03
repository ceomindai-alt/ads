// src/utils/axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"      // Local backend
    : "https://ads-2quj.onrender.com/api"; // Render backend

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || "Unexpected error occurred";

    if (status === 401) {
      localStorage.removeItem("token");
      toast.error("Session expired. Please log in again.");
    }

    if (status >= 400 && status < 500) toast.error(message);
    if (status >= 500) toast.error("Server error.");

    return Promise.reject(error);
  }
);

export default axiosInstance;
