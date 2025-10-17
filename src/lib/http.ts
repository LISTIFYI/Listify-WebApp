import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Tokens } from '@/lib/token';

// Interface for token payload
interface TokenPayload {
    exp: number;
    iat: number;
    sub: string;
}

// Interface for refresh token response based on API
interface RefreshResponse {
    success: boolean;
    message: string;
    token: string; // New access token
    refresh_token: string; // New refresh token
}

class ApiInterceptor {
    private api: AxiosInstance;
    private isRefreshing: boolean = false;
    private refreshSubscribers: Array<(token: string) => void> = [];
    private tokenStore: {
        get: () => Tokens | null;
        set: (tokens: Tokens) => void;
        clear: () => void;
    };

    constructor(tokenStore: { get: () => Tokens | null; set: (tokens: Tokens) => void; clear: () => void }) {
        this.tokenStore = tokenStore;
        this.api = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    // Check if access token is expired
    private isTokenExpired(token: string | undefined): boolean {
        if (!token) return true;
        try {
            const tokens = this.tokenStore.get();
            if (!tokens?.accessExp) return true;
            const currentTime = Date.now();
            return tokens.accessExp < currentTime;
        } catch {
            return true;
        }
    }

    // Refresh token logic with JWT decoding
    private async refreshAccessToken(): Promise<string> {
        const tokens = this.tokenStore.get();
        const refreshToken = tokens?.refreshToken;
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await this.api.post<RefreshResponse>('/auth/refresh_token', {
                refreshToken: refreshToken,
            });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Token refresh failed');
            }
            const { token: accessToken, refresh_token: newRefreshToken } = response.data;

            // Decode JWTs to get expiration times
            const decodedAccess = jwtDecode<TokenPayload>(accessToken);
            const decodedRefresh = jwtDecode<TokenPayload>(newRefreshToken);

            const accessExp = decodedAccess.exp * 1000; // Convert to ms
            const refreshExp = decodedRefresh.exp * 1000; // Convert to ms

            const newTokens: Tokens = {
                accessToken,
                refreshToken: newRefreshToken,
                accessExp,
                refreshExp,
            };
            this.tokenStore.set(newTokens);
            return accessToken;
        } catch (error: any) {
            // If 401, assume refresh token is expired
            if (error.response?.status === 401) {
                this.tokenStore.clear();
                throw new Error('Refresh token expired');
            }
            this.tokenStore.clear();
            throw new Error('Token refresh failed: ' + (error.response?.data?.message || error.message));
        }
    }

    // Add subscriber to queue during token refresh
    private onRefreshed(token: string) {
        this.refreshSubscribers.forEach((callback) => callback(token));
        this.refreshSubscribers = [];
    }

    // Queue requests while refreshing
    private addRefreshSubscriber(callback: (token: string) => void) {
        this.refreshSubscribers.push(callback);
    }

    // Setup Axios interceptors
    private setupInterceptors() {
        this.api.interceptors.request.use(
            (config: any) => {
                const tokens = this.tokenStore.get();
                const token = tokens?.accessToken;
                if (token && !config.url?.includes('/auth/')) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error),
        );

        this.api.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                const originalRequest = error.config;

                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url?.includes('/auth/')
                ) {
                    if (this.isRefreshing) {
                        return new Promise((resolve) => {
                            this.addRefreshSubscriber((token: string) => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                resolve(this.api(originalRequest));
                            });
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const newAccessToken = await this.refreshAccessToken();
                        this.isRefreshing = false;
                        this.onRefreshed(newAccessToken);

                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return this.api(originalRequest);
                    } catch (refreshError) {
                        this.isRefreshing = false;
                        this.onRefreshed('');
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            },
        );
    }

    // Public method to make API requests
    public getApi() {
        return this.api;
    }
}

// Export singleton instance with tokenStore
let apiInstance: ApiInterceptor | null = null;
export const initializeApi = (tokenStore: { get: () => Tokens | null; set: (tokens: Tokens) => void; clear: () => void }) => {
    if (!apiInstance) {
        apiInstance = new ApiInterceptor(tokenStore);
    }
    return apiInstance;
};

export default ApiInterceptor;