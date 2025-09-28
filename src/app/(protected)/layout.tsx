// src/app/(protected)/layout.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useEffect, useRef } from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, showLogin, openLogin } = useAuth();
    const hasOpenedModal = useRef(false);
    useAuthGuard(); // handles redirect on hard failures

    // Only open modal once when component mounts and user is not authenticated
    useEffect(() => {
        if (!loading && !user && !showLogin && !hasOpenedModal.current) {
            openLogin();
            hasOpenedModal.current = true;
        }
    }, [loading, user, showLogin, openLogin]);

    // Reset the flag when user becomes authenticated
    useEffect(() => {
        if (user) {
            hasOpenedModal.current = false;
        }
    }, [user]);

    if (loading) return null;

    if (!user) {
        return null; // Don't render children, modal will be shown by AppShell
    }

    return <>{children}</>;
}