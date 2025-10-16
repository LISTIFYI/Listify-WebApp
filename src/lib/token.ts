export type Tokens = {
    accessToken: string;
    refreshToken: string;
    // Optional: if your API returns expiries, store them in milliseconds since epoch
    accessExp?: number; // milliseconds since epoch
    refreshExp?: number; // milliseconds since epoch
};

const ACCESS_KEY = 'lf.access';
const REFRESH_KEY = 'lf.refresh';
const ACCESS_EXP = 'lf.accessExp';
const REFRESH_EXP = 'lf.refreshExp';

export const tokenStore = {
    get(): Tokens | null {
        if (typeof window === 'undefined') return null;
        const accessToken = localStorage.getItem(ACCESS_KEY);
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (!accessToken || !refreshToken) return null;

        const accessExpStr = localStorage.getItem(ACCESS_EXP);
        const refreshExpStr = localStorage.getItem(REFRESH_EXP);
        const accessExp = accessExpStr ? parseInt(accessExpStr, 10) : undefined;
        const refreshExp = refreshExpStr ? parseInt(refreshExpStr, 10) : undefined;

        // Validate expiration times to avoid NaN
        if (accessExp !== undefined && isNaN(accessExp)) {
            console.warn('Invalid accessExp in localStorage, ignoring');
            return { accessToken, refreshToken };
        }
        if (refreshExp !== undefined && isNaN(refreshExp)) {
            console.warn('Invalid refreshExp in localStorage, ignoring');
            return { accessToken, refreshToken, accessExp };
        }

        return {
            accessToken,
            refreshToken,
            accessExp,
            refreshExp,
        };
    },

    set(tokens: Tokens) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ACCESS_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
        if (tokens.accessExp !== undefined) localStorage.setItem(ACCESS_EXP, String(tokens.accessExp));
        if (tokens.refreshExp !== undefined) localStorage.setItem(REFRESH_EXP, String(tokens.refreshExp));
    },

    clear() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(ACCESS_EXP);
        localStorage.removeItem(REFRESH_EXP);
    },
};