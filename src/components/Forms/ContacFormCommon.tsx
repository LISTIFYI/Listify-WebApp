'use client';

import React, { useState } from 'react';
import InputBox from '../CustomFields/InputBox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface ContactI {
    name: string;
    mobile: string;
    email: string;
}

interface ContactFormProps {
    onSubmit: (contacts: ContactI[], editIndex?: number) => void;
    initialContacts?: ContactI[];
    editIndex?: number;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, initialContacts, editIndex }) => {
    const [contacts, setContacts] = useState<ContactI[]>(
        initialContacts || [{ name: '', mobile: '', email: '' }]
    );
    const [errors, setErrors] = useState<Record<number, Partial<ContactI>>>({});

    const validateContact = (contact: ContactI) => {
        const newErrors: Partial<ContactI> = {};

        if (!contact.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // const mobileRegex = /^(?:\+91)?[6-9]\d{9}$/;
        // if (!contact.mobile.trim()) {
        //     newErrors.mobile = 'Mobile number is required';
        // } else if (!mobileRegex.test(contact.mobile)) {
        //     newErrors.mobile = 'Enter a valid Indian mobile number';
        // }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (contact.email && !emailRegex.test(contact.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        return newErrors;
    };

    const handleChange = (index: number, field: keyof ContactI, value: string) => {
        const updated = [...contacts];
        updated[index][field] = value;
        setContacts(updated);

        // Clear errors for the changed field
        setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors[index]?.[field]) {
                delete newErrors[index][field];
                if (Object.keys(newErrors[index]).length === 0) {
                    delete newErrors[index];
                }
            }
            return newErrors;
        });
    };

    const handleAddContact = () => {
        setContacts([...contacts, { name: '', mobile: '', email: '' }]);
    };

    const handleRemoveContact = (index: number) => {
        if (contacts.length > 1) {
            const updated = contacts.filter((_, i) => i !== index);
            setContacts(updated);
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[index];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<number, Partial<ContactI>> = {};

        contacts.forEach((contact, idx) => {
            const contactErrors = validateContact(contact);
            if (Object.keys(contactErrors).length > 0) {
                newErrors[idx] = contactErrors;
            }
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(contacts, editIndex);
            setContacts([{ name: '', mobile: '', email: '' }]); // Reset form
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {contacts.map((contact, idx) => (
                <div key={idx} className="p-3 space-y-3 rounded-md border bg-gray-50 relative">
                    {contacts.length > 1 && (
                        <button
                            type="button"
                            onClick={() => handleRemoveContact(idx)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Name *
                        </label>
                        <InputBox
                            name="name"
                            value={contact.name}
                            onChange={(value: string) => handleChange(idx, 'name', value)}
                            placeholder="Enter name"
                            className="mt-1"
                        />
                        {errors[idx]?.name && (
                            <p className="text-red-500 text-xs mt-1">{errors[idx]?.name}</p>
                        )}
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Mobile *
                        </label>
                        <InputBox
                            name="mobile"
                            value={contact.mobile}
                            onChange={(value: string) => handleChange(idx, 'mobile', value)}
                            placeholder="Enter mobile number"
                            className="mt-1"
                        />
                        {errors[idx]?.mobile && (
                            <p className="text-red-500 text-xs mt-1">{errors[idx]?.mobile}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email (optional)
                        </label>
                        <InputBox
                            name="email"
                            value={contact.email}
                            onChange={(value: string) => handleChange(idx, 'email', value)}
                            placeholder="Enter email"
                            className="mt-1"
                        />
                        {errors[idx]?.email && (
                            <p className="text-red-500 text-xs mt-1">{errors[idx]?.email}</p>
                        )}
                    </div>
                </div>
            ))}
            <div className="flex justify-between">
                <Button type="submit" className="bg-black h-8">
                    {editIndex !== undefined ? 'Update' : 'Submit'}
                </Button>
            </div>
        </form>
    );
};
export default ContactForm;