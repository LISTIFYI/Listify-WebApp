export interface Tokens {
    accessToken: string;
    refreshToken: string;
    accessExp?: number;
    refreshExp?: number;
}

export const tokenStore = {
    get: (): Tokens | null => {
        if (typeof window === 'undefined') return null;
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const accessExp = localStorage.getItem('access_exp');
        const refreshExp = localStorage.getItem('refresh_exp');
        if (!accessToken || !refreshToken) return null;
        return {
            accessToken,
            refreshToken,
            accessExp: accessExp ? parseInt(accessExp) : undefined,
            refreshExp: refreshExp ? parseInt(refreshExp) : undefined,
        };
    },
    set: (tokens: Tokens) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);
        if (tokens.accessExp) localStorage.setItem('access_exp', tokens.accessExp.toString());
        if (tokens.refreshExp) localStorage.setItem('refresh_exp', tokens.refreshExp.toString());
    },
    clear: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access_exp');
        localStorage.removeItem('refresh_exp');
    },
};