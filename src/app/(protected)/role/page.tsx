"use client"

import AgentBuilderProfileForm from '@/components/AgentBuilderProfileForm/AgentBuilderProfileForm';
import SelectRole from '@/components/AgentBuilderProfileForm/SelectRole';
import InputBox from '@/components/CustomFields/InputBox';
import TextAreaBox from '@/components/CustomFields/TextAreaBox';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'


interface FormData {
    builderName: string;
    agentName: string;
    companyBrandName: string;
    photo: string | null;
    yearsOfOperation: string;
    totalProjects: string;
    projectsCompleted: string;
    projectsOngoing: string;
    address: string;
    builderDescription: string;
    primaryContactPersonName: string;
    email: string;
    contactNumber: string;
    alternateNumber: string;
    profilePhoto: null;
    reraNumber: string;
    operatingSince: string;
    dealClosed: string;
    dealsIn: string[];
    IDProof: string;
    state: string;
    city: string;
    operatingCity: string;
    officeAddress: string;
    localitiesOfOperation: string[];
}

const Role = () => {
    const { role, setRoleGlobally } = useAuth()
    const [selectedTrue, setSelectedTrue] = useState<boolean>(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [formData, setFormData] = useState<FormData>({
        builderName: "",
        agentName: "",
        companyBrandName: "",
        photo: null,
        profilePhoto: null,
        reraNumber: "",
        operatingSince: "",
        dealClosed: "",
        dealsIn: [],
        IDProof: "",
        state: "",
        city: "",
        yearsOfOperation: "",
        totalProjects: "",
        projectsCompleted: "",
        projectsOngoing: "",
        address: "",
        builderDescription: "",
        primaryContactPersonName: "",
        email: "",
        contactNumber: "",
        alternateNumber: "",
        operatingCity: "",
        officeAddress: "",
        localitiesOfOperation: [],
    });
    const handleInputChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    return (
        <div className="h-full flex flex-col">
            {!selectedTrue ? (
                <>
                    {/* Scrollable form section */}
                    <div className="flex-1 w-[60%] m-6 px-6 mx-auto overflow-auto">
                        <AgentBuilderProfileForm
                            errors={errors}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            role={role ?? ""}
                        />
                    </div>

                    {/* Fixed button at bottom */}
                    <div className="w-[60%] mx-auto pb-4 mx-6">
                        <button
                            className="cursor-pointer bg-black text-white text-[15px] rounded-md h-[42px] w-full mt-5 font-medium disabled:bg-gray-200 disabled:text-gray-400"
                        >
                            Continue
                        </button>
                    </div>
                </>
            ) : (
                <SelectRole
                    selectedTrue={selectedTrue}
                    setSelectedTrue={setSelectedTrue}
                    role={role ?? ""}
                    setRoleGlobally={setRoleGlobally}
                />
            )}
        </div>

    )
}





export default Role
