'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const useAuthGuard = () => {
    const router = useRouter();
    const { user, loading, showLogin } = useAuth();

    useEffect(() => {
        if (loading) return;

        // 1) If user is missing but the login modal is showing,
        //    DO NOT redirect. Let the modal finish the flow.
        if (!user && showLogin) return;

        // 2) Only hard-redirect to "/" when we explicitly know the auth expired.
        //    (Set by the interceptor below.)
        const reason = sessionStorage.getItem('auth.reason');
        if (!user && reason === 'expired') {
            sessionStorage.removeItem('auth.reason');
            router.replace('/');
        }
    }, [loading, user, showLogin, router]);
};
