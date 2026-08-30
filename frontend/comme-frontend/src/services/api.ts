import axios from 'axios';

axios.defaults.withCredentials = true;

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Sanctum CSRF Cookie Initializer (no-op since api/* is exempt from CSRF token checks)
export const initCsrf = async () => Promise.resolve();

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