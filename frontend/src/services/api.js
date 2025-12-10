import axios from "axios";
import { config } from "../config/env.js";

const axiosClient = axios.create({
  baseURL: config.apiBaseUrl,
});

// taking token from browser --------

axiosClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("localStorage not available");
    }

    return config;
  },
  (error) => Promise.reject(error)
);


axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.error || error.response?.data || "";
    
    if (error.response?.status === 401 || 
        error.response?.status === 403 ||
        (typeof errorMessage === 'string' && errorMessage.includes('User not found'))) {
      console.error("Authentication failed, user not found, or database reset - logging out");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosClient;