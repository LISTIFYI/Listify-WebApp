// src/components/auth/OtpStep.tsx
'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const OtpStep: React.FC<{
    phone: string;
    onVerified: () => void;
    onBack: () => void;
    onClose?: () => void;
}> = ({ phone, onVerified, onBack, onClose }) => {
    const { verifyOtp } = useAuth();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        if (!/^\d{4,6}$/.test(otp)) { setErr('Enter valid OTP'); return; }
        setLoading(true);
        try {
            await verifyOtp(`+91${phone}`, otp);
            onVerified();
        } catch (e: any) {
            setErr(e?.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <h2 className="text-xl font-semibold">Enter OTP</h2>
            <input
                className="w-full rounded-lg border p-3"
                placeholder="One-Time Password"
                value={otp}
                onChange={e => setOtp(e.target.value)}
            />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-3">
                <button disabled={loading} className="rounded-lg bg-black px-4 py-2 text-white">{loading ? 'Verifying…' : 'Verify'}</button>
                <button type="button" className="rounded-lg border px-4 py-2" onClick={onBack}>Back</button>
                {onClose && (
                    <button type="button" className="rounded-lg border px-4 py-2" onClick={onClose}>Cancel</button>
                )}
            </div>
        </form>
    );
};

export default OtpStep;
