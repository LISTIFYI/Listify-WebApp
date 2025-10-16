import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenStore, Tokens } from './token';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

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

const handleTokenRefreshHeaders = (response: AxiosResponse) => {
    const headers = response.headers ?? {};
    const refreshed = String(headers['x-token-refreshed'] ?? '').trim().toLowerCase() === 'true';

    if (!refreshed) return false;

    const newAccessToken = headers['x-new-access-token'];
    const newRefreshToken = headers['x-new-refresh-token'];
    const accessExp = headers['x-access-token-expiry'] ? parseInt(headers['x-access-token-expiry']) * 1000 : undefined; // Convert to ms if in seconds
    const refreshExp = headers['x-refresh-token-expiry'] ? parseInt(headers['x-refresh-token-expiry']) * 1000 : undefined;

    if (newAccessToken) {
        tokenStore.set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || tokenStore.get()?.refreshToken,
            accessExp,
            refreshExp,
        });
        console.log('Tokens refreshed', { accessExp, refreshExp });
        return true;
    }
    return false;
};

const handleExpiredRefreshToken = () => {
    console.warn('Refresh token expired, clearing session and redirecting');
    tokenStore.clear();
    sessionStorage.setItem('auth.reason', 'expired');
    if (typeof window !== 'undefined') {
        window.location.reload();
        window.location.href = '/';
    }
};

const refreshTokenProactively = async () => {
    const tokens = tokenStore.get();
    if (!tokens?.refreshToken || !tokens.accessExp) {
        console.warn('No refresh token or access expiry available for proactive refresh');
        return false;
    }

    if (tokens.refreshExp && tokens.refreshExp < Date.now()) {
        handleExpiredRefreshToken();
        return false;
    }

    const now = Date.now();
    const timeUntilExpiry = tokens.accessExp - now;

    if (timeUntilExpiry > TOKEN_REFRESH_THRESHOLD) return false;

    try {
        isRefreshing = true;
        console.log('Attempting proactive token refresh', { timeUntilExpiry });
        const resp = await axios.post(`${API_BASE}/auth/refresh_token`, {
            refreshToken: tokens.refreshToken,
        });

        const { accessToken, refreshToken, accessExp, refreshExp } = resp.data;
        if (!accessToken) throw new Error('No access token in refresh response');

        tokenStore.set({ accessToken, refreshToken, accessExp, refreshExp });
        resolveQueue(accessToken);
        console.log('Proactive token refresh successful', { accessExp, refreshExp });
        return true;
    } catch (err) {
        console.error('Proactive refresh failed:', err);
        rejectQueue(err);
        handleExpiredRefreshToken();
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

http.interceptors.request.use(async (config: CustomAxiosRequestConfig) => {
    const tokens = tokenStore.get();
    if (tokens?.accessToken) {
        config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }

    if (tokens?.refreshExp && tokens.refreshExp < Date.now()) {
        handleExpiredRefreshToken();
        return config;
    }

    if (!isRefreshing && config.url !== '/auth/refresh_token') {
        await refreshTokenProactively();
        const updatedTokens = tokenStore.get();
        if (updatedTokens?.accessToken) {
            config.headers.set('Authorization', `Bearer ${updatedTokens.accessToken}`);
        }
    }

    return config;
});

http.interceptors.response.use(
    async (res: AxiosResponse) => {
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

        if (status === 401 && !original._retry) {
            original._retry = true;

            if (error.response && handleTokenRefreshHeaders(error.response)) {
                const tokens = tokenStore.get();
                if (tokens?.accessToken) {
                    original.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
                    return http(original);
                }
            }

            const currentTokens = tokenStore.get();
            if (!currentTokens?.refreshToken) {
                console.warn('No refresh token available, clearing session');
                handleExpiredRefreshToken();
                return Promise.reject(new Error('No refresh token available'));
            }

            if (currentTokens.refreshExp && currentTokens.refreshExp < Date.now()) {
                handleExpiredRefreshToken();
                return Promise.reject(new Error('Refresh token expired'));
            }

            if (isRefreshing) {
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
                console.log('Token refresh successful', { accessExp, refreshExp });
                original.headers.set('Authorization', `Bearer ${accessToken}`);
                return http(original);
            } catch (refreshErr) {
                console.error('Refresh token failed:', refreshErr);
                rejectQueue(refreshErr);
                handleExpiredRefreshToken();
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        console.error('API error:', error.message, error.response?.data);
        return Promise.reject(error);
    }
);

if (typeof window !== 'undefined') {
    setInterval(refreshTokenProactively, 30 * 1000); // Check every 30 seconds
}