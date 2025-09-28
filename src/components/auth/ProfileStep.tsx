    // src/components/auth/ProfileStep.tsx
'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const ProfileStep: React.FC<{ onDone: () => void; onClose?: () => void; }> = ({ onDone, onClose }) => {
    const { completeProfile } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', age: '', gender: '' });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        const ageNum = Number(form.age);
        if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || !ageNum || ageNum < 18 || ageNum > 120 || !['male', 'female', 'other'].includes(form.gender)) {
            setErr('All fields are required. Age 18–120.');
            return;
        }
        setLoading(true);
        try {
            await completeProfile({ name: form.name, email: form.email, age: ageNum, gender: form.gender as any });
            onDone();
        } catch (e: any) {
            setErr(e?.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <h2 className="text-xl font-semibold">Complete your profile</h2>
            <input className="w-full rounded-lg border p-3" placeholder="Name" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} />
            <input className="w-full rounded-lg border p-3" placeholder="Email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} />
            <input className="w-full rounded-lg border p-3" placeholder="Age" value={form.age} onChange={e => setForm(v => ({ ...v, age: e.target.value }))} />
            <select className="w-full rounded-lg border p-3" value={form.gender} onChange={e => setForm(v => ({ ...v, gender: e.target.value }))}>
                <option value="" disabled>Gender</option>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-3">
                <button disabled={loading} className="flex-1 rounded-lg bg-black px-4 py-2 text-white">{loading ? 'Saving…' : 'Save & Continue'}</button>
                {onClose && (
                    <button type="button" className="rounded-lg border px-4 py-2" onClick={onClose}>Cancel</button>
                )}
            </div>
        </form>
    );
};

export default ProfileStep;
