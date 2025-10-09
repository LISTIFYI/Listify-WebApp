// src/components/auth/LoginModal.tsx
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react'; // Optional: For close icon, assuming you have lucide-react installed
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import PhoneStep from './PhoneStep';
import OtpStep from './OtpStep';
import ProfileStep from './ProfileStep';
import Image from 'next/image';
import Logo from '../../assets/logo.png'


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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            closeLogin();
            setStep('phone'); // Reset step when closing
        }
    };

    return (
        <Dialog open={showLogin} onOpenChange={handleOpenChange} >
            <DialogContent showCloseButton={false} className={`
                rounded-2xl p-0 shadow-xl  ${step === "profile" ? "max-w-lg" : "max-w-lg"}`}>

                <div className='flex flex-row justify-between items-center p-4 pb-3 border-b'>
                    <div className='flex flex-row gap-2'>
                        <Image src={Logo} alt="logo" className="max-w-[30px] h-[30px] border " />
                        <h1 className='text-[22px]  text-black font-[700] text-nowrap  text-start'>Listifyi</h1>
                    </div>
                    <div
                        onClick={() => {
                            closeLogin()
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