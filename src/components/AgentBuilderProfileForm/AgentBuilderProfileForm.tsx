import React, { useRef, useState } from 'react'
import InputBox from '../CustomFields/InputBox'
import TextAreaBox from '../CustomFields/TextAreaBox'
import { ChipList } from '../CustomFields/ChipList';
import { ChevronLeft, Image, LoaderCircle, Plus, X } from 'lucide-react';
import { UploadPhoto } from '@/utils/api';
import { tokenStore } from '@/lib/token';
import { IoDocument } from 'react-icons/io5';

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

    const fileInputRefPDF = useRef<HTMLInputElement | null>(null)

    const handleClick = () => {
        fileInputRefPDF.current?.click()
    }

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const tk = tokenStore.get()
        setUploading(true)
        if (event.target.files && event.target.files[0]) {
            const payload = {
                entity: "POST",
                fileExtension: event.target.files[0].type.split("/").pop(),
                type: event.target.files[0].type.split("/")[0] === "video" ? "VIDEO" : "IMAGE",
                name: event.target.files[0].name.split(".")[0],
            };
            const fileType = event.target.files[0].type.split("/")[0] === "video" ? "video" : "image"
            const res = await UploadPhoto(payload, tk?.accessToken ?? "", event.target.files?.[0], fileType)
            setUploading(false)
            if (role === "builder") {
                handleInputChange("photo", res.fileUrl)

            } else {
                handleInputChange("profilePhoto", res.fileUrl)

            }
        }
    };

    const onRemoveImage = () => {
        if (role === "builder") {
            handleInputChange("photo", null)

        } else {
            handleInputChange("profilePhoto", null)

        }
    }

    const handleFileChangePDF = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const tk = tokenStore.get();
            const extension = file.type.split("/").pop()
            const name = file.name.split(".")[0];
            const payload = {
                entity: "DOCUMENTS",
                fileExtension: extension,
                type: "DOCUMENT",
                name: name,
            };

            try {
                const res = await UploadPhoto(payload, tk?.accessToken ?? "", file, "document")
                if (res.fileUrl) {
                    handleInputChange("IDProof", res.fileUrl)
                }
            } catch (error) {
                console.log("Something went wrong", error);

            }
        }
    }

    const removePdf = () => {
        // setBrochure("")
    }

    return (
        <div className='w-full mx-auto'>
            <h1

                className='text-lg cursor-pointer flex flex-row items-center gap-1 font-semibold mb-6'>
                <button
                    onClick={() => {
                        setSelectedTrue(false)
                    }}
                    className='cursor-pointer'><ChevronLeft size={28} /></button>
                Create your {role === "builder" ? "Builder" : "Agent"} Profile</h1>
            <div className="space-y-4">
                <div className='flex flex-row gap-4'>
                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700">{role === "builder" ? "Builder name" : "Agent name"}</label>
                        <InputBox
                            placeholder={role === "builder" ? "Builder name" : "Agent name"}
                            value={role === "builder" ? formData.builderName : formData.agentName}
                            onChange={(text: string) => handleInputChange(role === "builder" ? "builderName" : "agentName", text)}
                            className="mt-1"
                        />
                        {errors[role === "builder" ? "builderName" : "agentName"] && (
                            <p className="text-red-500 text-sm mt-1">{errors[role === "builder" ? "builderName" : "agentName"]}</p>
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
                    <label className="block text-sm font-medium text-gray-700">{role === "agent" ? "Profile Photo" : "Company Logo"}</label>
                    <div
                        onClick={handleUploadClick}
                        className='border flex flex-row items-center justify-center gap-1 border-gray-300 bg-white py-2 mt-1 px-2 text-sm text-gray-500 font-normal rounded-md'>
                        <Image size={16} />  {role === "agent" ? "Upload Photo" : "Upload Logo"}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    {
                        uploading ?
                            <div className="mt-3">
                                <div className='h-24 w-24 object-cover flex-col flex justify-center items-center rounded-md border'>
                                    <p className='text-[12px]'>Uploading...</p>
                                    <div className='w-fit h-fit animate-spin mt-1'>
                                        <LoaderCircle size={16} />
                                    </div>
                                </div>
                            </div>
                            :
                            <>
                                {(formData?.photo || formData?.profilePhoto) && (
                                    <div className="mt-3 relative w-fit">
                                        <img
                                            src={`${formData?.photo || formData?.profilePhoto}`}
                                            alt="Preview"
                                            className="h-24 w-24  object-cover rounded-md border"
                                        />
                                        <p
                                            onClick={onRemoveImage}
                                            className='absolute -top-1 cursor-pointer -right-1 bg-white rounded-full border w-[20px] flex justify-center items-center h-[20px] '><X size={16} color='red' /></p>
                                    </div>
                                )}

                            </>
                    }
                </div>

                {
                    role === "builder" &&
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
                    role === "agent" &&
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
                                    value={formData.operatingSince}
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

                <div className='flex flex-col md:flex-row lg:flex-row gap-4'>
                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700">{role === "builder" ? "Address" : "Office Address"}</label>
                        <TextAreaBox
                            placeholder={role === "builder" ? "Address" : "Office address"}
                            value={role === "builder" ? formData.address : formData.officeAddress}
                            onChange={(text: string) => handleInputChange(role === "builder" ? "address" : "officeAddress", text)}
                            className="mt-1"
                        />
                        {errors[role === "builder" ? "address" : "officeAddress"] && (
                            <p className="text-red-500 text-sm mt-1">{errors[role === "builder" ? "address" : "officeAddress"]}</p>
                        )}
                    </div>
                    {
                        role === "builder" &&
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
                    role === "agent" &&
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
                            role === "builder" &&
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

                <div className='flex flex-row gap-4'>
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                            ID Proof (PDF)
                        </label>
                        <div
                            className="mt-1 h-[36px] flex flex-col relative justify-center items-center bg-gray-100 transition-all duration-300 border rounded-sm text-sm cursor-pointer hover:bg-gray-200"
                            onClick={() => {
                                if (!formData.IDProof && formData.IDProof === "") {
                                    handleClick()
                                }
                            }}
                        >
                            {
                                formData.IDProof ? (
                                    <div className="flex flex-row gap-1 items-center justify-start px-4 w-full overflow-hidden">
                                        <IoDocument size={16} />
                                        <span className="font-medium text-sm truncate w-full max-w-[300px]">
                                            {formData.IDProof.split("/").pop()}
                                        </span>
                                    </div>
                                ) : (
                                    <h1 className="font-medium text-sm">ID Proof (PDF)</h1>
                                )
                            }

                            {formData.IDProof &&
                                <div
                                    onClick={removePdf}
                                    className='border w-fit absolute top-[-10px] rounded-full shadow-md bg-gray-100 right-[-8px]'><X color='red' size={16} /></div>
                            }
                        </div>

                        {/* Hidden input */}
                        <input
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRefPDF}
                            onChange={handleFileChangePDF}
                            className="hidden"
                        />
                    </div>

                </div>

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
                                className="px-4 h-8 bg-gray-200 text-gray-800 rounded-md text-sm flex items-center gap-2"
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
