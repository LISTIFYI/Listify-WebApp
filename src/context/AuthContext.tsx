// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { http } from '@/lib/http';
import { tokenStore, Tokens } from '@/lib/token';

type User = {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    roles?: "Builder" | "Agent"
    builderProfile?: any
    agentProfile?: any
    // ...more
};

type AuthState = {
    user: User | null;
    tokens: Tokens | null;
    loading: boolean;
    showLogin: boolean;
    role: string | null; // Added role state
    // flows
    startPhoneLogin: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, otp: string) => Promise<void>;
    completeProfile: (data: Required<Pick<User, 'name' | 'email' | 'age' | 'gender'>>) => Promise<void>;
    logout: () => void;
    openLogin: () => void;
    closeLogin: () => void;
    clearRole: () => void;
    setRoleGlobally: (role: string) => void;
    toggleAdminMode: () => void; // Added toggleAdminMode
    isAdmin: boolean

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
    const [role, setRole] = useState<string | null>("Builder");
    const [isAdmin, setIsAdmin] = useState<boolean>(false); // Initialize isAdmin
    console.log("isAdmn", isAdmin);

    // Try load user if tokens exist
    useEffect(() => {
        const init = async () => {
            try {
                const tk = tokenStore.get();
                setTokens(tk);
                if (tk?.accessToken) {
                    const me = await http.get('/users/profile'); // your API
                    console.log("meeeee", me);

                    setUser(me.data);
                }
            } catch {
                tokenStore.clear();
                setUser(null);
                setTokens(null);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const startPhoneLogin = async (phone: string) => {
        await http.post('/auth/mobile_login_otp', { mobile_number: phone }); // sends OTP
    };

    const verifyOtp = async (phone: string, otp: string) => {
        // Returns tokens (and maybe partial user)
        const res = await http.post('/auth/mobile_verify_otp', { mobile_number: phone, otp_code: otp });
        const { token, refresh_token, user: u } = res.data as {
            token: string;
            refresh_token: string;
            user: any;
        };

        // Map to our internal shape
        const tk: Tokens = {
            accessToken: token,
            refreshToken: refresh_token,
            // no expiries provided by API -> leave undefined
        };

        tokenStore.set(tk);
        setTokens(tk);

        // Optional normalisation (match your User type)
        const normalizedUser = u
            ? {
                id: u.id,
                phone: u.mobile_number,
                name: u.name,
                email: u.email,
                age: u.age,
                gender: typeof u.gender === 'string' ? (u.gender.toLowerCase() as 'male' | 'female' | 'other') : undefined,
                roles: u.roles ?? [],
                // copy anything else you need from API
            }
            : null;

        setUser(normalizedUser);
    };

    const completeProfile = async (payload: Required<Pick<User, 'name' | 'email' | 'age' | 'gender'>>) => {
        const res = await http.post('/users/profile', payload);
        setUser(res.data);
        setShowLogin(false);
    };

    const logout = () => {
        tokenStore.clear();
        setUser(null);
        setTokens(null);
        // optional: tell API to revoke refresh token
        // http.post('/auth/logout').catch(()=>{});
    };

    const setRoleGlobally = (newRole: string) => {
        setRole(newRole); // Set role globally
    };
    const clearRole = () => {
        setRole(null); // Clear role without affecting other auth state
    };


    const toggleAdminMode = () => {
        setIsAdmin(prev => !prev);
    };

    const value = useMemo<AuthState>(() => ({
        user, tokens, loading, showLogin,
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
        isAdmin
    }), [user, tokens, loading, showLogin, isAdmin]);

    return (
        <AuthCtx.Provider value={value}>
            {children}
        </AuthCtx.Provider>
    );
};
