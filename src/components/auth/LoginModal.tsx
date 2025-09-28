// src/components/auth/LoginModal.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import PhoneStep from './PhoneStep';
import OtpStep from './OtpStep';
import ProfileStep from './ProfileStep';

type Step = 'phone' | 'otp' | 'profile';

const LoginModal: React.FC = () => {
    const { closeLogin, user, showLogin } = useAuth();
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState<string>('');

    // If user exists but missing required profile fields, go to profile step
    React.useEffect(() => {
        if (user) {
            const needsProfile = !user.name || !user.email || !user.age || !user.gender;
            setStep(needsProfile ? 'profile' : 'phone');
            if (!needsProfile) closeLogin();
        }
    }, [user, closeLogin]);


    if (!showLogin) return null; // <-- KEY: don’t render when closed


    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeLogin();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                {step === 'phone' && (
                    <PhoneStep
                        onNext={(p) => { setPhone(p); setStep('otp'); }}
                        onClose={closeLogin}
                    />
                )}
                {step === 'otp' && (
                    <OtpStep
                        phone={phone}
                        onVerified={() => setStep('profile')}
                        onBack={() => setStep('phone')}
                        onClose={closeLogin}
                    />
                )}
                {step === 'profile' && (
                    <ProfileStep
                        onDone={closeLogin}
                        onClose={closeLogin}
                    />
                )}
            </div>
        </div>
    );
};

export default LoginModal;
