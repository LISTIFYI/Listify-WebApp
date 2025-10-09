'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const OtpStep: React.FC<{
    phone: string;
    onVerified: () => void;
    onBack: () => void;
    onClose?: () => void;
}> = ({ phone, onVerified, onBack, onClose }) => {
    const { verifyOtp, startPhoneLogin } = useAuth();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [timer, setTimer] = useState(80); // 1 minute 20 seconds

    // Countdown logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Format mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        if (!/^\d{4,6}$/.test(otp)) {
            setErr('Enter a valid OTP');
            return;
        }
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

    const handleResendOtp = async () => {
        if (timer > 0) return;
        setLoading(true);
        setErr(null);
        try {
            await startPhoneLogin(`+91${phone}`);
            setTimer(80); // Restart 1:20 timer
        } catch (e: any) {
            setErr(e?.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Verify OTP</h2>
                <p className="text-sm text-gray-500 mt-1">
                    We’ve sent a verification code to <span className="font-medium text-gray-800">+91 {phone}</span>.
                    Please enter it below.
                </p>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Enter OTP</label>
                <input
                    type="text"
                    className="w-full rounded-md border px-3 h-10 outline-none focus:ring-1 focus:ring-black transition"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                {err && <p className="text-sm text-red-600 mt-1">{err}</p>}
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    disabled={loading}
                    className="flex-1 rounded-md cursor-pointer bg-black text-[15px] text-white font-medium h-10 hover:bg-gray-900 transition disabled:opacity-60"
                >
                    {loading ? 'Verifying…' : 'Verify'}
                </button>
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 rounded-md border cursor-pointer text-[15px] border-gray-300 h-10 text-gray-700 hover:bg-gray-50 transition"
                >
                    Back
                </button>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-md cursor-pointer border text-[15px] border-gray-300 h-10 text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {timer > 0 ? (
                <p className="text-sm text-gray-500 text-center">
                    Resend OTP in <span className="font-medium text-gray-800">{formatTime(timer)}</span>
                </p>
            ) : (
                <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="block w-full cursor-pointer text-sm font-medium text-blue-600 hover:underline text-center mt-2 disabled:text-gray-400"
                >
                    Resend OTP
                </button>
            )}
        </form>
    );
};

export default OtpStep;
