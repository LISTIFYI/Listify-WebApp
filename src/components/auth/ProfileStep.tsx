'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import DropdownMenuCustom from '../CustomFields/DropdownMenuCustom';
import { DropdownConfig } from '@/types/listingTypes';

const ProfileStep: React.FC<{ onDone: () => void; onClose?: () => void }> = ({ onDone, onClose }) => {
    const { completeProfile } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', age: '', gender: '' });
    console.log(form);

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        const ageNum = Number(form.age);

        if (
            !form.name ||
            !/^\S+@\S+\.\S+$/.test(form.email) ||
            !ageNum ||
            ageNum < 18 ||
            ageNum > 120 ||
            !['male', 'female', 'other'].includes(form.gender)
        ) {
            setErr('Please fill all fields correctly. Age must be between 18–120.');
            return;
        }

        setLoading(true);
        try {
            await completeProfile({
                name: form.name,
                email: form.email,
                age: ageNum,
                gender: form.gender as any,
            });
            onDone();
        } catch (e: any) {
            setErr(e?.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const dropdownConfigs: DropdownConfig[] = [
        {
            key: 'gender',
            label: 'Gender',
            placeholder: 'Select Gender',
            options: [
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "Other", label: "Other" },
            ],
        },
    ]

    return (
        <div className=" w-full">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Welcome to <span className="text-black tracking-wider font-extrabold">Listify</span> 🎉</h1>
                <p className="text-gray-600 mt-2">
                    Let’s complete your profile to personalize your experience.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        className="w-full rounded-md  border outline-none placeholder:text-sm focus-within:border-black transition-colors duration-300  px-3 h-10"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        className="w-full rounded-md  border outline-none placeholder:text-sm focus-within:border-black transition-colors duration-300  px-3 h-10"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                        type="number"
                        className="w-full rounded-md border outline-none placeholder:text-sm focus-within:border-black transition-colors duration-300   px-3 h-10"
                        placeholder="Enter your age"
                        value={form.age}
                        onChange={(e) => setForm((v) => ({ ...v, age: e.target.value }))}
                    />
                </div>

                <div>
                    <DropdownMenuCustom
                        key={dropdownConfigs[0].key}
                        options={dropdownConfigs[0].options}
                        value={form.gender}
                        onChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}
                        placeholder={dropdownConfigs[0].placeholder}
                        label={dropdownConfigs[0].label}
                    />
                </div>

                {err && <p className="text-sm text-red-600 text-center">{err}</p>}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3">
                    <button
                        disabled={loading}
                        className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-black hover:bg-gray-800 text-white font-medium h-10 transition-colors"
                    >
                        {loading && <Loader2 className="animate-spin h-4 w-4" />}
                        {loading ? 'Saving…' : 'Save & Continue'}
                    </button>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border h-10 border-gray-300 px-4  hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Footer note */}
            <p className="text-xs text-gray-500 text-center mt-6">
                Your information helps us tailor your Listify experience. 💡
            </p>
        </div>
    );
};

export default ProfileStep;
