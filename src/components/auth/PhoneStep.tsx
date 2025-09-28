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
            <h2 className="text-xl font-semibold">Login with Phone</h2>
            <input
                className="w-full rounded-lg border p-3"
                placeholder="Phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
            />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-3">
                <button disabled={loading} className="rounded-lg bg-black px-4 py-2 text-white">{loading ? 'Sending…' : 'Send OTP'}</button>
                <button type="button" className="rounded-lg border px-4 py-2" onClick={() => {
                    onClose()
                    router.replace("/")
                }}>Cancel</button>
            </div>
        </form>
    );
};

export default PhoneStep;
