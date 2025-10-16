// src/components/auth/LoginModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react'; // Optional: For close icon, assuming you have lucide-react installed
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import PhoneStep from './PhoneStep';
import OtpStep from './OtpStep';
import ProfileStep from './ProfileStep';
import Image from 'next/image';
import Logo from '../../assets/logo.png'
import { useRouter } from 'next/navigation';


type Step = 'phone' | 'otp' | 'profile';

const LoginModal: React.FC = () => {
    const { closeLogin, user, showLogin } = useAuth();
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState<string>('');
    const router = useRouter()


    // If user exists but missing required profile fields, go to profile step
    React.useEffect(() => {
        if (user) {
            const needsProfile = !user.name || !user.email || !user.age || !user.gender;
            setStep(needsProfile ? 'profile' : 'phone');
            if (!needsProfile) closeLogin();
        }
    }, [user, closeLogin]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            closeLogin();
            setStep('phone');
            setTimeout(() => {
                router.push('/');
            }, 100);
        }
    };
    const dialogContentRef = useRef<HTMLDivElement>(null);

    // Handle keyboard visibility and modal positioning
    useEffect(() => {
        const handleKeyboard = () => {
            if (dialogContentRef.current && window.visualViewport) {
                const keyboardHeight = window.innerHeight - window.visualViewport.height;
                if (keyboardHeight > 0) {
                    // Keyboard is open, shift modal up
                    dialogContentRef.current.style.transform = `translateY(-${keyboardHeight / 2}px)`;
                    dialogContentRef.current.style.transition = 'transform 0.3s ease-in-out';
                } else {
                    // Keyboard is closed, reset position
                    dialogContentRef.current.style.transform = 'translateY(0)';
                }
            }
        };

        // Listen for viewport resize (keyboard open/close) and input focus
        window.visualViewport?.addEventListener('resize', handleKeyboard);
        document.addEventListener('focusin', handleKeyboard);
        document.addEventListener('focusout', handleKeyboard);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleKeyboard);
            document.removeEventListener('focusin', handleKeyboard);
            document.removeEventListener('focusout', handleKeyboard);
        };
    }, []);

    return (
        <Dialog open={showLogin} onOpenChange={() => {
            if (step !== "profile") {
                handleOpenChange
            }
        }} >
            <DialogContent
                ref={dialogContentRef}
                showCloseButton={false} className={`
                rounded-2xl p-0 shadow-xl  ${step === "profile" ? "w-[90%] md:max-w-lg lg:max-w-lg" : "w-[90%] md:max-w-lg lg:max-w-lg"}`}>

                <div className='flex flex-row justify-between items-center p-4 pb-3 border-b'>
                    <div className='flex flex-row gap-2'>
                        <Image src={Logo} alt="logo" className="max-w-[30px] h-[30px] border " />
                        <h1 className='text-[22px]  text-black font-[700] text-nowrap  text-start'>Listifyi</h1>
                    </div>
                    <div
                        onClick={() => {
                            closeLogin()
                            setTimeout(() => {
                                router.push('/');
                            }, 100);
                        }}
                        className='flex border cursor-pointer ml-auto border-slate-300  hover:bg-gray-50 transition-all duration-300 rounded-full w-[32px] h-[32px] justify-center items-center '>
                        <X size={22} />
                    </div>
                </div>

                <div className='px-6 pb-4'>
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
            </DialogContent>
        </Dialog>
    );
};

export default LoginModal;