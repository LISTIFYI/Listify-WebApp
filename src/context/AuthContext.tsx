'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStore, Tokens } from '@/lib/token';
import { initializeApi } from '@/lib/http';
import { jwtDecode } from 'jwt-decode'

export interface Filters {
    [key: string]: any;
}

type User = {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    roles?: ('Builder' | 'Agent')[];
    builderProfile?: any;
    agentProfile?: any;
    profile_pic?: string;
    profilePhoto?: string;
};

type AuthState = {
    user: User | null;
    tokens: Tokens | null;
    loading: boolean;
    showLogin: boolean;
    role: string | null;
    isAdmin: boolean;
    filters: Filters;
    openFilter: boolean;
    startPhoneLogin: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, otp: string) => Promise<void>;
    completeProfile: (data: Required<Pick<User, 'name' | 'email' | 'age' | 'gender'>>) => Promise<void>;
    logout: () => void;
    openLogin: () => void;
    closeLogin: () => void;
    clearRole: () => void;
    setRoleGlobally: (role: string) => void;
    toggleAdminMode: () => void;
    addFilters: (filters: Filters) => void;
    removeAllFilters: () => void;
    setOpenFilter: (value: boolean) => void;
};

const AuthCtx = createContext<AuthState | null>(null);
export const useAuth = () => {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<Tokens | null>(tokenStore.get());
    const [loading, setLoading] = useState<boolean>(true);
    const [showLogin, setShowLogin] = useState<boolean>(false);
    const [role, setRole] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [filters, setFilters] = useState<Filters>({});
    const [openFilter, setOpenFilter] = useState(false);

    // Initialize API interceptor with tokenStore
    const api = useMemo(() => initializeApi(tokenStore).getApi(), []);


    useEffect(() => {
        const init = async () => {
            try {
                const tk = tokenStore.get();
                setTokens(tk);
                if (tk?.accessToken) {
                    const me = await api.get('/users/profile');
                    setUser(me.data);
                    setRole(me.data.roles?.includes('Builder') ? 'builder' : me.data.roles?.includes('Agent') ? 'agent' : null);
                }
            } catch (error) {
                console.error('Failed to load user profile:', error);
                tokenStore.clear();
                setUser(null);
                setTokens(null);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [api]);

    const startPhoneLogin = async (phone: string) => {
        await api.post('/auth/mobile_login_otp', { mobile_number: phone });
    };

    const verifyOtp = async (phone: string, otp: string) => {
        const res = await api.post('/auth/mobile_verify_otp', { mobile_number: phone, otp_code: otp });
        const { token: accessToken, refresh_token: refreshToken, user: u, accessExp, refreshExp } = res.data;
        const decodedAccess = jwtDecode<any>(accessToken);
        console.log("dedeodeomdeomdoemde", decodedAccess);


        const tk: Tokens = {
            accessToken,
            refreshToken,
            accessExp: accessExp ? accessExp * 1000 : undefined,
            refreshExp: refreshExp ? refreshExp * 1000 : undefined,
        };

        tokenStore.set(tk);
        setTokens(tk);

        const normalizedUser = u
            ? {
                id: u.id,
                phone: u.mobile_number,
                name: u.name,
                email: u.email,
                age: u.age,
                gender: typeof u.gender === 'string' ? (u.gender.toLowerCase() as 'male' | 'female' | 'other') : undefined,
                roles: u.roles ?? [],
            }
            : null;

        setUser(normalizedUser);
        setRole(normalizedUser?.roles?.includes('Builder') ? 'builder' : normalizedUser?.roles?.includes('Agent') ? 'agent' : null);
    };

    const completeProfile = async (payload: Required<Pick<User, 'name' | 'email' | 'age' | 'gender'>>) => {
        const res = await api.put('/users/profile', payload);
        setUser(res.data);
        setShowLogin(false);
    };

    const logout = () => {
        tokenStore.clear();
        setUser(null);
        setTokens(null);
        setRole(null);
        setIsAdmin(false);
    };

    const setRoleGlobally = (newRole: string) => {
        setRole(newRole);
    };

    const clearRole = () => {
        setRole(null);
    };

    const toggleAdminMode = () => {
        setIsAdmin((prev) => !prev);
    };

    const addFilters = (newFilters: Filters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const removeAllFilters = () => {
        setFilters({});
    };

    const value = useMemo<AuthState>(
        () => ({
            user,
            tokens,
            loading,
            showLogin,
            startPhoneLogin,
            verifyOtp,
            completeProfile,
            logout,
            openLogin: () => setShowLogin(true),
            closeLogin: () => setShowLogin(false),
            clearRole,
            setRoleGlobally,
            role,
            toggleAdminMode,
            isAdmin,
            addFilters,
            filters,
            removeAllFilters,
            openFilter,
            setOpenFilter,
        }),
        [user, tokens, loading, showLogin, isAdmin, filters, openFilter, role, api],
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};