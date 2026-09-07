import axios from 'axios';

axios.defaults.withCredentials = true;

export const getApiBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.includes('localhost:8000')) {
        return envUrl;
    }
    // If running in browser on a deployed Cloud Run domain
    if (typeof window !== 'undefined' && window.location.hostname.includes('.run.app')) {
        return 'https://comme-backend-861966182598.asia-southeast2.run.app/api';
    }
    return envUrl || 'http://localhost:8000/api';
};

const rawBaseUrl = getApiBaseUrl();
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