import React, { useRef, useState } from 'react'
import InputBox from '../CustomFields/InputBox'
import TextAreaBox from '../CustomFields/TextAreaBox'
import { ChipList } from '../CustomFields/ChipList';
import { ChevronLeft, Plus } from 'lucide-react';

// Define the form data type
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
    profilePhoto: null,
    reraNumber: string,
    operatingSince: string,
    dealClosed: string,
    state: string,
    IDProof: string,
    city: string,
    operatingCity: string
    officeAddress: string
    localitiesOfOperation: string[];
    dealsIn: string[],
}

// Define props type for the component
interface FormBasicDetails1Props {
    formData: FormData;
    handleInputChange: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
    role: string
    errors: Partial<Record<keyof FormData, string>>; // Add errors prop
    selectedTrue: any
    setSelectedTrue: any
}



const AgentBuilderProfileForm = ({ formData, handleInputChange, role, errors, selectedTrue, setSelectedTrue }: FormBasicDetails1Props) => {

    const [localityInput, setLocalityInput] = useState("");


    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);

            console.log("Selected file:", file);
            // Later you can upload `file` to backend / cloud storage
        }
    };
    return (
        <div className='w-full mx-auto'>
            <h1

                className='text-lg cursor-pointer flex flex-row items-center gap-1 font-semibold mb-6'>
                <button
                    onClick={() => {
                        setSelectedTrue(false)
                    }}
                    className='cursor-pointer'><ChevronLeft size={28} /></button>
                Create your {role === "Builder" ? "Builder" : "Agent"} Profile</h1>
            <div className="space-y-4">
                <div className='flex flex-row gap-4'>
                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700">{role === "Builder" ? "Builder name" : "Agent name"}</label>
                        <InputBox
                            placeholder={role === "Builder" ? "Builder name" : "Agent name"}
                            value={role === "Builder" ? formData.builderName : formData.agentName}
                            onChange={(text: string) => handleInputChange(role === "Builder" ? "builderName" : "agentName", text)}
                            className="mt-1"
                        />
                        {errors[role === "Builder" ? "builderName" : "agentName"] && (
                            <p className="text-red-500 text-sm mt-1">{errors[role === "Builder" ? "builderName" : "agentName"]}</p>
                        )}
                    </div>
                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700">Company/Brand Name</label>
                        <InputBox
                            placeholder="Company/Brand name"
                            value={formData.companyBrandName}
                            onChange={(text) => handleInputChange("companyBrandName", text)}
                            className="mt-1"
                        />
                        {errors.companyBrandName && (
                            <p className="text-red-500 text-sm mt-1">{errors.companyBrandName}</p>
                        )}
                    </div>
                </div>

                <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700">{role === "Agent" ? "Profile Photo" : "Company Logo"}</label>
                    <div
                        onClick={handleUploadClick}
                        className='border border-gray-300 bg-white py-2 mt-1 px-2 text-sm text-gray-500 font-normal rounded-md'>
                        {role === "Agent" ? "Upload Photo" : "Upload Logo"}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    {previewUrl && (
                        <div className="mt-3">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-24 w-24 object-cover rounded-md border"
                            />
                        </div>
                    )}
                </div>

                {
                    role === "Builder" &&
                    <>
                        <div className='flex flex-row gap-4'>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">Years of Operation</label>
                                <InputBox
                                    placeholder="Years of operation"
                                    value={formData.yearsOfOperation}
                                    onChange={(text) => handleInputChange("yearsOfOperation", text)}
                                    className="mt-1"
                                />
                                {errors.yearsOfOperation && (
                                    <p className="text-red-500 text-sm mt-1">{errors.yearsOfOperation}</p>
                                )}
                            </div>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">Total Projects</label>
                                <InputBox
                                    placeholder="Total projects"
                                    value={formData.totalProjects}
                                    onChange={(text) => handleInputChange("totalProjects", text)}
                                    className="mt-1"
                                />
                                {errors.totalProjects && (
                                    <p className="text-red-500 text-sm mt-1">{errors.totalProjects}</p>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-row gap-4'>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">Projects Completed</label>
                                <InputBox
                                    placeholder="Projects completed"
                                    value={formData.projectsCompleted}
                                    onChange={(text) => handleInputChange("projectsCompleted", text)}
                                    className="mt-1"
                                />
                                {errors.projectsCompleted && (
                                    <p className="text-red-500 text-sm mt-1">{errors.projectsCompleted}</p>
                                )}
                            </div>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">Projects Ongoing</label>
                                <InputBox
                                    placeholder="Total projects"
                                    value={formData.projectsOngoing}
                                    onChange={(text) => handleInputChange("projectsOngoing", text)}
                                    className="mt-1"
                                />
                                {errors.projectsOngoing && (
                                    <p className="text-red-500 text-sm mt-1">{errors.projectsOngoing}</p>
                                )}
                            </div>
                        </div>
                    </>
                }
                {
                    role === "Agent" &&
                    <>
                        <div className='flex flex-row gap-4'>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">RERA Number</label>
                                <InputBox
                                    placeholder="RERA number"
                                    value={formData.reraNumber}
                                    onChange={(text) => handleInputChange("reraNumber", text)}
                                    className="mt-1"
                                />
                                {errors.reraNumber && (
                                    <p className="text-red-500 text-sm mt-1">{errors.reraNumber}</p>
                                )}
                            </div>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">Projects Contact Number</label>
                                <InputBox
                                    placeholder="Contact number"
                                    value={formData.contactNumber}
                                    onChange={(text) => handleInputChange("contactNumber", text)}
                                    className="mt-1"
                                />
                                {errors.contactNumber && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-row gap-4'>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">Operating Since</label>
                                <InputBox
                                    placeholder="Operating since"
                                    value={formData.reraNumber}
                                    onChange={(text) => handleInputChange("operatingSince", text)}
                                    className="mt-1"
                                />
                                {errors.operatingSince && (
                                    <p className="text-red-500 text-sm mt-1">{errors.operatingSince}</p>
                                )}
                            </div>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">Deals Closed</label>
                                <InputBox
                                    placeholder="Deals closed"
                                    value={formData.dealClosed}
                                    onChange={(text) => handleInputChange("dealClosed", text)}
                                    className="mt-1"
                                />
                                {errors.dealClosed && (
                                    <p className="text-red-500 text-sm mt-1">{errors.dealClosed}</p>
                                )}
                            </div>
                        </div>
                    </>
                }

                <div className='flex flex-row gap-4'>
                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700">{role === "Builder" ? "Address" : "Office Address"}</label>
                        <TextAreaBox
                            placeholder={role === "Builder" ? "Address" : "Office address"}
                            value={role === "Builder" ? formData.address : formData.officeAddress}
                            onChange={(text: string) => handleInputChange(role === "Builder" ? "address" : "officeAddress", text)}
                            className="mt-1"
                        />
                        {errors[role === "Builder" ? "address" : "officeAddress"] && (
                            <p className="text-red-500 text-sm mt-1">{errors[role === "Builder" ? "address" : "officeAddress"]}</p>
                        )}
                    </div>
                    {
                        role === "Builder" &&
                        <div className='w-full'>
                            <label className="block text-sm font-medium text-gray-700">Builder Description</label>
                            <TextAreaBox
                                placeholder="Builder description"
                                value={formData.builderDescription}
                                onChange={(text) => handleInputChange("builderDescription", text)}
                                className="mt-1"
                            />
                            {errors.builderDescription && (
                                <p className="text-red-500 text-sm mt-1">{errors.builderDescription}</p>
                            )}
                        </div>
                    }
                </div>

                {
                    role === "Agent" &&
                    <>
                        <div className='flex flex-row gap-4'>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <InputBox
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={(text) => handleInputChange("city", text)}
                                    className="mt-1"
                                />
                                {errors.city && (
                                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                                )}
                            </div>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <InputBox
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={(text) => handleInputChange("state", text)}
                                    className="mt-1"
                                />
                                {errors.state && (
                                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                                )}
                            </div>
                        </div>
                    </>
                }


                <>
                    <div className='flex flex-row gap-4'>
                        {
                            role === "Builder" &&
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700">Official Contact Number</label>
                                <InputBox
                                    placeholder="Official contact number"
                                    value={formData.contactNumber}
                                    onChange={(text) => handleInputChange("contactNumber", text)}
                                    className="mt-1"
                                />
                                {errors.contactNumber && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
                                )}
                            </div>
                        }
                        <div className='w-full'>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <InputBox
                                placeholder="Email"
                                value={formData.email}
                                onChange={(text) => handleInputChange("email", text)}
                                className="mt-1"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>
                    </div>
                </>

                <div className="w-full mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Localities of Operation
                    </label>

                    <div className="flex items-center gap-2 mt-1">
                        <InputBox
                            placeholder="Enter locality"
                            value={localityInput}
                            onChange={(text) => setLocalityInput(text)}
                            className="flex-1"
                        />
                        <button
                            type="button"
                            className="px-3 h-9 bg-black text-white rounded-md"
                            onClick={() => {
                                if (localityInput.trim()) {
                                    handleInputChange("localitiesOfOperation", [
                                        ...formData.localitiesOfOperation,
                                        localityInput.trim(),
                                    ]);
                                    setLocalityInput(""); // clear input after adding
                                }
                            }}
                        >
                            <Plus />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.localitiesOfOperation.map((locality, index) => (
                            <span
                                key={index}
                                className="px-3 bg-gray-200 text-gray-800 rounded-full text-sm flex items-center gap-2"
                            >
                                {locality}
                                <button
                                    type="button"
                                    className="text-red-500 font-bold"
                                    onClick={() => {
                                        const updated = formData.localitiesOfOperation.filter(
                                            (_, i) => i !== index
                                        );
                                        handleInputChange("localitiesOfOperation", updated);
                                    }}
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>

                </div>


            </div>
        </div>
    )
}

export default AgentBuilderProfileForm
