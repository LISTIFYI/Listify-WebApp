// src/lib/http.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { tokenStore } from './token';

const API_BASE = 'https://listifyi-api-1012443530727.asia-south1.run.app';

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
    res => res,
    async (error: AxiosError) => {
        const original = error.config as any;
        const status = error.response?.status;

        // try refresh once on 401
        if (status === 401 && !original?._retry) {
            original._retry = true;

            const currentTokens = tokenStore.get();
            if (!currentTokens?.refreshToken) {
                tokenStore.clear();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // queue while refresh in progress
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
                // Adjust to your API contract:
                // e.g. POST /auth/refresh with { refreshToken } or header 'x-refresh-token'
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

                // mark the reason so the guard knows it's an expiry, not just "not logged in yet"
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('auth.reason', 'expired');
                }
                return Promise.reject(refreshErr);
            }
            finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
