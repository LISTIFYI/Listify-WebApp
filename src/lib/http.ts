// src/lib/http.ts
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { tokenStore } from './token';

const API_BASE = 'https://listifyi-api-dev-1012443530727.asia-south1.run.app';
// https://listifyi-api-dev-1012443530727.asia-south1.run.app

let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function resolveQueue(token: string) {
    pendingQueue.forEach(p => p.resolve(token));
    pendingQueue = [];
}

function rejectQueue(err: unknown) {
    pendingQueue.forEach(p => p.reject(err));
    pendingQueue = [];
}

// Helper to handle token refresh headers (mimicking useApi's handleTokenRefreshHeaders)
const handleTokenRefreshHeaders = (response: AxiosResponse) => {
    const headers = response.headers ?? {};
    const refreshed = String(headers['x-token-refreshed'] ?? '').trim().toLowerCase() === 'true';

    if (!refreshed) return false;

    const newAccessToken = headers['x-new-access-token'];
    const newRefreshToken = headers['x-new-refresh-token'];

    if (newAccessToken) {
        tokenStore.set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || tokenStore.get()?.refreshToken,
            accessExp: undefined, // Adjust based on your API contract
            refreshExp: undefined, // Adjust based on your API contract
        });
        return true; // Tokens were refreshed
    }
    return false;
};

export const http: AxiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
    timeout: 20000,
});

http.interceptors.request.use((config) => {
    const tokens = tokenStore.get();
    if (tokens?.accessToken) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${tokens.accessToken}`,
        };
    }
    return config;
});

http.interceptors.response.use(
    async (res) => {
        // Check for refreshed tokens in successful responses (like useApi)
        await handleTokenRefreshHeaders(res);
        return res;
    },
    async (error: AxiosError) => {
        const original = error.config as any;
        const status = error.response?.status;

        // Try refresh once on 401
        if (status === 401 && !original?._retry) {
            original._retry = true;

            // Check if the error response includes refreshed tokens (like useApi)
            if (error.response && handleTokenRefreshHeaders(error.response)) {
                // Tokens were refreshed in headers, retry with new tokens
                original.headers = {
                    ...original.headers,
                    Authorization: `Bearer ${tokenStore.get()?.accessToken}`,
                };
                return http(original);
            }

            // Fallback to explicit refresh token request (existing http.ts behavior)
            const currentTokens = tokenStore.get();
            if (!currentTokens?.refreshToken) {
                tokenStore.clear();
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('auth.reason', 'expired');
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue while refresh in progress
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve: (token) => {
                            original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
                            resolve(http(original));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;
            try {
                // Call refresh endpoint (adjust to your API contract)
                const resp = await axios.post(`${API_BASE}/auth/refresh_token`, {
                    refreshToken: currentTokens.refreshToken,
                });

                const { accessToken, refreshToken, accessExp, refreshExp } = resp.data;
                tokenStore.set({ accessToken, refreshToken, accessExp, refreshExp });
                resolveQueue(accessToken);
                original.headers = { ...original.headers, Authorization: `Bearer ${accessToken}` };
                return http(original);
            } catch (refreshErr) {
                rejectQueue(refreshErr);
                tokenStore.clear();
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('auth.reason', 'expired');
                }
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);