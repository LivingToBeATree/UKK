import axios from 'axios';
import { toast } from '@/components/ui/sonner';

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

// Request Interceptor: Ensure CSRF cookie is initialized before mutating requests and attach Bearer token if present
api.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('comme_token');
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

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

// Response Interceptor: Automatically store bearer tokens and clean storage on 401
api.interceptors.response.use(
    (response) => {
        if (typeof window !== 'undefined') {
            const token = response.data?.data?.token;
            if (token && typeof token === 'string') {
                localStorage.setItem('comme_token', token);
            }
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 419) {
            csrfPromise = null;
        }
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('comme_user');
            localStorage.removeItem('comme_token');
        }
        if (error.response?.status === 429 && typeof window !== 'undefined') {
            const retryAfter = error.response.headers?.['retry-after'];
            const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;
            toast.error(`Rate limit exceeded. Please wait ${seconds}s before retrying.`);
        }
        return Promise.reject(error);
    }
);