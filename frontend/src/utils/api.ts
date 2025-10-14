import axios from 'axios';
import {JWT_TOKEN_KEY} from "@consts/localStorage.ts";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(JWT_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or unauthorized
            localStorage.removeItem('token');
            window.location.href = '/login'; // Or use React Router's `navigate`
        }
        return Promise.reject(error);
    }
);

export default api;
