import axios from 'axios';

const backendRoot = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Sanctum CSRF Cookie Initializer
export const initCsrf = async () => {
    return axios.get(`${backendRoot}/sanctum/csrf-cookie`, { withCredentials: true });
};

// Response Interceptor: Clean storage on 401 without hijacking public route navigation
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('comme_user');
        }
        return Promise.reject(error);
    }
);