// src/lib/token.ts
export type Tokens = {
    accessToken: string;
    refreshToken: string;
    // Optional: if your API returns expiries, store them too
    accessExp?: number;  // seconds since epoch
    refreshExp?: number; // seconds since epoch
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

        const accessExpStr = localStorage.getItem(ACCESS_EXP) || undefined;
        const refreshExpStr = localStorage.getItem(REFRESH_EXP) || undefined;
        return {
            accessToken,
            refreshToken,
            accessExp: accessExpStr ? Number(accessExpStr) : undefined,
            refreshExp: refreshExpStr ? Number(refreshExpStr) : undefined,
        };
    },

    set(tokens: Tokens) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ACCESS_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
        if (tokens.accessExp) localStorage.setItem(ACCESS_EXP, String(tokens.accessExp));
        if (tokens.refreshExp) localStorage.setItem(REFRESH_EXP, String(tokens.refreshExp));
    },

    clear() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(ACCESS_EXP);
        localStorage.removeItem(REFRESH_EXP);
    },
};
