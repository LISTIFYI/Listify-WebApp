// src/components/auth/PhoneStep.tsx
'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const PhoneStep: React.FC<{ onNext: (phone: string) => void; onClose: () => void; }> = ({ onNext, onClose }) => {
    const { startPhoneLogin, closeLogin } = useAuth();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const router = useRouter()

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        if (!/^\d{10}$/.test(phone)) { setErr('Enter a valid 10-digit phone'); return; }
        setLoading(true);
        try {
            await startPhoneLogin(`+91${phone}`);
            onNext(phone);
        } catch (e: any) {
            setErr(e?.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Sign in with your mobile number</h2>
                <p className="text-sm text-gray-500 mt-1">
                    We’ll send you a one-time password (OTP) for quick and secure verification.
                </p>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Mobile Number</label>
                <div className="flex items-center border rounded-md px-3 h-10 focus-within:ring-1 focus-within:ring-black transition">
                    <span className="text-gray-500 mr-2 select-none">+91</span>
                    <input
                        type="tel"
                        className="flex-1 outline-none bg-transparent text-gray-900"
                        placeholder="Enter your 10-digit number"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    />
                </div>
                {err && <p className="text-sm text-red-600 mt-1">{err}</p>}
            </div>
            <div className="flex gap-3 pt-2">
                <button
                    disabled={loading}
                    className="flex-1 rounded-md text-[15px] bg-black text-white font-medium h-10 hover:bg-gray-900 cursor-pointer transition disabled:opacity-60"
                >
                    {loading ? 'Sending OTP…' : 'Send OTP'}
                </button>
                <button
                    type="button"
                    onClick={() => { onClose(); router.replace('/'); }}
                    className="flex-1 rounded-md text-[15px] border border-gray-300 h-10 text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default PhoneStep;
