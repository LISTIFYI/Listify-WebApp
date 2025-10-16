import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './token';

// Extend Axios config type to include custom _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://listifyi-api-dev-1012443530727.asia-south1.run.app';
const API_BASE = 'https://listifyi-api-dev-1012443530727.asia-south1.run.app';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry (in ms)
const QUEUE_TIMEOUT = 10000; // 10 seconds timeout for queued requests

let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function resolveQueue(token: string) {
    pendingQueue.forEach((p) => p.resolve(token));
    pendingQueue = [];
}

function rejectQueue(err: unknown) {
    pendingQueue.forEach((p) => p.reject(err));
    pendingQueue = [];
}

// Helper to handle token refresh headers
const handleTokenRefreshHeaders = (response: AxiosResponse) => {
    const headers = response.headers ?? {};
    const refreshed = String(headers['x-token-refreshed'] ?? '').trim().toLowerCase() === 'true';

    if (!refreshed) return false;

    const newAccessToken = headers['x-new-access-token'];
    const newRefreshToken = headers['x-new-refresh-token'];
    const accessExp = headers['x-access-token-expiry'] ? parseInt(headers['x-access-token-expiry']) : undefined;
    const refreshExp = headers['x-refresh-token-expiry'] ? parseInt(headers['x-refresh-token-expiry']) : undefined;

    if (newAccessToken) {
        tokenStore.set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || tokenStore.get()?.refreshToken,
            accessExp,
            refreshExp,
        });
        return true; // Tokens were refreshed
    }
    return false;
};

// Check if refresh token is expired and handle logout
const handleExpiredRefreshToken = () => {
    console.warn('Refresh token expired, clearing session and redirecting');
    tokenStore.clear();
    sessionStorage.setItem('auth.reason', 'expired');
    if (typeof window !== 'undefined') {
        window.location.reload(); // Refresh the window
        window.location.href = '/'; // Navigate to root
    }
};

// Proactive token refresh before expiry
const refreshTokenProactively = async () => {
    const tokens = tokenStore.get();
    if (!tokens?.refreshToken || !tokens.accessExp) {
        console.warn('No refresh token or access expiry available for proactive refresh');
        return false;
    }

    // Check if refresh token is expired
    if (tokens.refreshExp && tokens.refreshExp < Date.now()) {
        handleExpiredRefreshToken();
        return false;
    }

    const now = Date.now();
    const timeUntilExpiry = tokens.accessExp - now;

    if (timeUntilExpiry > TOKEN_REFRESH_THRESHOLD) return false; // Token not close to expiry

    try {
        isRefreshing = true;
        const resp = await axios.post(`${API_BASE}/auth/refresh_token`, {
            refreshToken: tokens.refreshToken,
        });

        const { accessToken, refreshToken, accessExp, refreshExp } = resp.data;
        if (!accessToken) throw new Error('No access token in refresh response');

        tokenStore.set({ accessToken, refreshToken, accessExp, refreshExp });
        resolveQueue(accessToken);
        console.log('Proactive token refresh successful');
        return true;
    } catch (err) {
        console.error('Proactive refresh failed:', err);
        rejectQueue(err);
        handleExpiredRefreshToken(); // Assume refresh token is invalid/expired
        return false;
    } finally {
        isRefreshing = false;
    }
};

export const http: AxiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
    timeout: 20000,
});

// Request interceptor to attach tokens and check for proactive refresh
http.interceptors.request.use(async (config: CustomAxiosRequestConfig) => {
    const tokens = tokenStore.get();
    if (tokens?.accessToken) {
        config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }

    // Check if refresh token is expired
    if (tokens?.refreshExp && tokens.refreshExp < Date.now()) {
        handleExpiredRefreshToken();
        return config; // Will be rejected by response interceptor if needed
    }

    // Proactively refresh token if close to expiry (skip for refresh endpoint)
    if (!isRefreshing && config.url !== '/auth/refresh_token') {
        await refreshTokenProactively();
        const updatedTokens = tokenStore.get();
        if (updatedTokens?.accessToken) {
            config.headers.set('Authorization', `Bearer ${updatedTokens.accessToken}`);
        }
    }

    return config;
});

// Response interceptor for handling 401 and token refresh
http.interceptors.response.use(
    async (res: AxiosResponse) => {
        // Check for refreshed tokens in successful responses
        await handleTokenRefreshHeaders(res);
        return res;
    },
    async (error: AxiosError) => {
        if (!error.config) {
            console.error('No config in Axios error:', error);
            return Promise.reject(error);
        }

        const original: CustomAxiosRequestConfig = error.config;
        const status = error.response?.status;

        // Handle 401 errors
        if (status === 401 && !original._retry) {
            original._retry = true;

            // Check if error response includes refreshed tokens
            if (error.response && handleTokenRefreshHeaders(error.response)) {
                const tokens = tokenStore.get();
                if (tokens?.accessToken) {
                    original.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
                    return http(original);
                }
            }

            // Fallback to explicit refresh token request
            const currentTokens = tokenStore.get();
            if (!currentTokens?.refreshToken) {
                console.warn('No refresh token available, clearing session');
                handleExpiredRefreshToken();
                return Promise.reject(new Error('No refresh token available'));
            }

            // Check if refresh token is expired
            if (currentTokens.refreshExp && currentTokens.refreshExp < Date.now()) {
                handleExpiredRefreshToken();
                return Promise.reject(new Error('Refresh token expired'));
            }

            if (isRefreshing) {
                // Queue request while refresh in progress
                return new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error('Token refresh timed out'));
                    }, QUEUE_TIMEOUT);
                    pendingQueue.push({
                        resolve: (token) => {
                            clearTimeout(timeoutId);
                            original.headers.set('Authorization', `Bearer ${token}`);
                            resolve(http(original));
                        },
                        reject: (err) => {
                            clearTimeout(timeoutId);
                            reject(err);
                        },
                    });
                });
            }

            isRefreshing = true;
            try {
                const resp = await axios.post(`${API_BASE}/auth/refresh_token`, {
                    refreshToken: currentTokens.refreshToken,
                });

                const { accessToken, refreshToken, accessExp, refreshExp } = resp.data;
                if (!accessToken) throw new Error('No access token in refresh response');

                tokenStore.set({ accessToken, refreshToken, accessExp, refreshExp });
                resolveQueue(accessToken);
                console.log('Token refresh successful');
                original.headers.set('Authorization', `Bearer ${accessToken}`);
                return http(original);
            } catch (refreshErr) {
                console.error('Refresh token failed:', refreshErr);
                rejectQueue(refreshErr);
                handleExpiredRefreshToken(); // Assume refresh token is invalid/expired
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        console.error('API error:', error.message, error.response?.data);
        return Promise.reject(error);
    }
);

// Periodic check for proactive refresh
if (typeof window !== 'undefined') {
    setInterval(refreshTokenProactively, 60 * 1000); // Check every minute
}