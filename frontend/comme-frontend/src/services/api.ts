import axios from 'axios';

axios.defaults.withCredentials = true;

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendRootUrl = rawBaseUrl.replace(/\/api\/?$/, '');

export const api = axios.create({
    baseURL: rawBaseUrl,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    withXSRFToken: true,
});

let csrfPromise: Promise<unknown> | null = null;

// Sanctum CSRF Cookie Initializer
export const initCsrf = async () => {
    if (!csrfPromise) {
        csrfPromise = axios.get(`${backendRootUrl}/sanctum/csrf-cookie`, { withCredentials: true })
            .catch((err) => {
                csrfPromise = null;
                throw err;
            });
    }
    return csrfPromise;
};

// Request Interceptor: Ensure CSRF cookie is initialized before mutating requests
api.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase() || '';
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        try {
            await initCsrf();
        } catch {
            // Proceed; backend will validate
        }
    }
    return config;
});

// Response Interceptor: Clean storage on 401 without hijacking public route navigation
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 419) {
            csrfPromise = null;
        }
        if (error.response?.status === 401) {
            localStorage.removeItem('comme_user');
        }
        return Promise.reject(error);
    }
);