"use client";

import React, { useRef, useState } from "react";
import DropdownMenuCustom from "../CustomFields/DropdownMenuCustom";
import { DropdownConfig } from "@/types/listingTypes";
import InputBox from "../CustomFields/InputBox";
import { Upload, X } from "lucide-react";
import ButtonCommon from "../CustomFields/Button";
import { tokenStore } from "@/lib/token";
import { UploadPhoto } from "@/utils/api";

export type FloorPlan = {
    bhkType: string;
    superArea: string;
    unitSize: string;
    amount: string;
    estimatedEmi: string;
    possessionDate: string;
    floorPlanImages: File[]; // Changed to File[] for consistency
    viewFloorPlanURL: string;
    noOfBedroom: string;
    noOfBathroom: string;
    noOfBalcony: string;
};

export const initialPlan: FloorPlan = {
    bhkType: "",
    superArea: "",
    unitSize: "Sqft",
    amount: "",
    estimatedEmi: "",
    possessionDate: "",
    floorPlanImages: [],
    viewFloorPlanURL: "",
    noOfBedroom: "",
    noOfBathroom: "",
    noOfBalcony: "",
};

interface PlanProps {
    floorPlans: FloorPlan[];
    setFloorPlans: React.Dispatch<React.SetStateAction<FloorPlan[]>>;
    openFP: boolean;
    setOpenFP: React.Dispatch<React.SetStateAction<boolean>>;
    handleEditPlan: (index: number) => void;
    handleRemovePlan: (index: number) => void;
    currentPlan: FloorPlan;
    setCurrentPlan: React.Dispatch<React.SetStateAction<FloorPlan>>;
    editIndex: number | null;
    setEditIndex: React.Dispatch<React.SetStateAction<number | null>>;
    handleAddOrUpdate: () => void;
}

const FloorPlanningPricing = ({
    setFloorPlans,
    currentPlan,
    setCurrentPlan,
    setEditIndex,
    editIndex,
    setOpenFP,
    handleEditPlan,
    handleRemovePlan,
    handleAddOrUpdate,
}: PlanProps) => {
    const dropdownConfigs: DropdownConfig[] = [
        {
            key: "unitTypes",
            label: "Unit Type",
            placeholder: "Select unit type",
            options: [
                { value: "1 BHK", label: "1 BHK" },
                { value: "2 BHK", label: "2 BHK" },
                { value: "3 BHK", label: "3 BHK" },
                { value: "4 BHK", label: "4 BHK" },
                { value: "4+ BHK", label: "4+ BHK" },
            ],
        },
        {
            key: "UnitRange",
            label: "Unit Range",
            placeholder: "Unit range",
            options: [
                { value: "Sqft", label: "Sqft" },
                { value: "Acre", label: "Acre" },
                { value: "Sq-ft", label: "Sq-ft", },
                { value: "Sq-yrd", label: "Sq-yrd", },
                { value: "Sq-m", label: "Sq-m", },
                { value: "Bigha", label: "Bigha", },
                { value: "Hectare", label: "Hectare", },
                { value: "Marla", label: "Marla", },
                { value: "Kanal", label: "Kanal", },
                { value: "Biswa1", label: "Biswa1", },
                { value: "Biswa2", label: "Biswa2", },
                { value: "Ground", label: "Ground", },
                { value: "Aankadam", label: "Aankadam", },
                { value: "Rood", label: "Rood", },
                { value: "Chatak", label: "Chatak", },
                { value: "Kottah", label: "Kottah", },
                { value: "Cent", label: "Cent", },
                { value: "Perch", label: "Perch", },
                { value: "Guntha", label: "Guntha", },
                { value: "Are", label: "Are", },
                { value: "Kuncham", label: "Kuncham", },
                { value: "Katha", label: "Katha", },
                { value: "Gaj", label: "Gaj", },
                { value: "Killa", label: "Killa", },
            ],
        },
        {
            key: "TotalBedroom",
            label: "Total Bedroom",
            placeholder: "Total bedroom",
            options: [
                { value: "1", label: "1 Bedroom" },
                { value: "2", label: "2 Bedrooms" },
                { value: "3", label: "3 Bedrooms" },
                { value: "4", label: "4 Bedrooms" },
                { value: "5", label: "5 Bedrooms" },
                { value: "6", label: "6 Bedrooms" },
                { value: "7", label: "7 Bedrooms" },
                { value: "8", label: "8 Bedrooms" },
                { value: "9", label: "9 Bedrooms" },
                { value: "10", label: "10 Bedrooms" },
            ],
        },
        {
            key: "TotalBathroom",
            label: "Total Bathroom",
            placeholder: "Total bathroom",
            options: [
                { value: "1", label: "1 Bathroom" },
                { value: "2", label: "2 Bathrooms" },
                { value: "3", label: "3 Bathrooms" },
                { value: "4", label: "4 Bathrooms" },
                { value: "5", label: "5 Bathrooms", },
                { value: "6", label: "6 Bathrooms", },
                { value: "7", label: "7 Bathrooms", },
                { value: "8", label: "8 Bathrooms", },
                { value: "9", label: "9 Bathrooms", },
                { value: "10", label: "10 Bathrooms", },
            ],
        },
        {
            key: "TotalBalcony",
            label: "Total Balcony",
            placeholder: "Total balcony",
            options: [
                { value: "0", label: "No Balcony" },
                { value: "1", label: "1 Balcony" },
                { value: "2", label: "2 Balconies" },
                { value: "3", label: "3 Balconies" },
                { value: "4", label: "4 Balconies" },
                { value: "5", label: "5 Balconies" }
            ],
        },
    ];

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const tk = tokenStore.get()

        if (e.target.files?.[0]) {
            const file = e.target.files[0]

            const payload = {
                entity: "POST",
                fileExtension: file.type.split("/").pop(),
                type: file.type.split("/")[0] === "video" ? "VIDEO" : "IMAGE",
                name: file.name.split(".")[0],
            }

            const fileType = file.type.split("/")[0] === "video" ? "video" : "image"

            const res = await UploadPhoto(payload, tk?.accessToken ?? "", file, fileType)

            // Save only uploaded file URL in both states
            setCurrentPlan((prev) => ({
                ...prev,
                floorPlanImages: [...prev.floorPlanImages, res.fileUrl],
            }))

        }
    }

    const removeImage = (index: number) => {
        setCurrentPlan((prev) => ({
            ...prev,
            floorPlanImages: prev.floorPlanImages.filter((_, i) => i !== index),
        }));
    };

    const [errors, setErrors] = useState({
        bhkType: "",
        superArea: "",
        unitSize: "",
        noOfBedroom: "",
        noOfBathroom: "",
        noOfBalcony: "",
    });

    const validateForm = () => {
        const newErrors = {
            bhkType: currentPlan.bhkType ? "" : "BHK Type is required",
            superArea: currentPlan.superArea ? "" : "Super Area is required",
            unitSize: currentPlan.unitSize ? "" : "Unit Size is required",
            noOfBedroom: currentPlan.noOfBedroom ? "" : "Number of Bedrooms is required",
            noOfBathroom: currentPlan.noOfBathroom ? "" : "Number of Bathrooms is required",
            noOfBalcony: currentPlan.noOfBalcony ? "" : "Number of Balconies is required",
        };

        setErrors(newErrors);
        return Object.values(newErrors).every((error) => !error);
    };

    const handleSubmit = () => {
        if (validateForm()) {
            handleAddOrUpdate();
        }
    };

    return (
        <div className="space-y-3 overflow-hidden">
            <div className="flex flex-row gap-4">
                <div className="flex flex-col flex-1">
                    <DropdownMenuCustom
                        key={dropdownConfigs[0].key}
                        options={dropdownConfigs[0].options}
                        value={currentPlan.bhkType}
                        onChange={(text: string) =>
                            setCurrentPlan((prev) => ({ ...prev, bhkType: text }))
                        }
                        placeholder={dropdownConfigs[0].placeholder}
                        label={dropdownConfigs[0].label}
                    />
                    {errors.bhkType && (
                        <p className="text-red-500 text-sm">{errors.bhkType}</p>
                    )}
                </div>
                <div className="flex flex-col flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                        Amount
                    </label>
                    <InputBox
                        name="Amount"
                        value={currentPlan.amount}
                        onChange={(text: string) =>
                            setCurrentPlan((prev) => ({ ...prev, amount: text }))
                        }
                        placeholder="Amount"
                        className="mt-1"
                    />
                </div>
            </div>
            <div className="flex flex-row gap-4">
                <div className="flex flex-col flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                        Super Area
                    </label>
                    <InputBox
                        name="Super Area"
                        value={currentPlan.superArea}
                        onChange={(text: string) =>
                            setCurrentPlan((prev) => ({ ...prev, superArea: text }))
                        }
                        placeholder="Super area"
                        className="mt-1"
                    />
                    {errors.superArea && (
                        <p className="text-red-500 text-sm">{errors.superArea}</p>
                    )}
                </div>
                <div className="flex flex-col flex-1">
                    <DropdownMenuCustom
                        key={dropdownConfigs[1].key}
                        options={dropdownConfigs[1].options}
                        value={currentPlan.unitSize}
                        onChange={(text: string) =>
                            setCurrentPlan((prev) => ({ ...prev, unitSize: text }))
                        }
                        placeholder={dropdownConfigs[1].placeholder}
                        label={dropdownConfigs[1].label}
                    />
                    {errors.unitSize && (
                        <p className="text-red-500 text-sm">{errors.unitSize}</p>
                    )}
                </div>
            </div>
            <div className="flex flex-row gap-4">
                <div className="flex flex-col flex-1">
                    <DropdownMenuCustom
                        key={dropdownConfigs[2].key}
                        options={dropdownConfigs[2].options}
                        value={currentPlan.noOfBedroom}
                        onChange={(text: string) =>
                            setCurrentPlan((prev) => ({ ...prev, noOfBedroom: text }))
                        }
                        placeholder={dropdownConfigs[2].placeholder}
                        label={dropdownConfigs[2].label}
                    />
                    {errors.noOfBedroom && (
                        <p className="text-red-500 text-sm">{errors.noOfBedroom}</p>
                    )}
                </div>
                <div className="flex flex-col flex-1">
                    <DropdownMenuCustom
                        key={dropdownConfigs[3].key}
                        options={dropdownConfigs[3].options}
                        value={currentPlan.noOfBathroom}
                        onChange={(text: string) =>
                            setCurrentPlan((prev) => ({ ...prev, noOfBathroom: text }))
                        }
                        placeholder={dropdownConfigs[3].placeholder}
                        label={dropdownConfigs[3].label}
                    />
                    {errors.noOfBathroom && (
                        <p className="text-red-500 text-sm">{errors.noOfBathroom}</p>
                    )}
                </div>
            </div>
            <div className="flex flex-row gap-4">
                <div className="flex flex-col flex-1">
                    <DropdownMenuCustom
                        key={dropdownConfigs[4].key}
                        options={dropdownConfigs[4].options}
                        value={currentPlan.noOfBalcony}
                        onChange={(text: string) =>
                            setCurrentPlan((prev) => ({ ...prev, noOfBalcony: text }))
                        }
                        placeholder={dropdownConfigs[4].placeholder}
                        label={dropdownConfigs[4].label}
                    />
                    {errors.noOfBalcony && (
                        <p className="text-red-500 text-sm">{errors.noOfBalcony}</p>
                    )}
                </div>
            </div>
            <div className="flex flex-col flex-1">
                <label className="block text-sm font-medium text-gray-700">
                    Upload Floor Plan Images
                </label>
                {currentPlan?.floorPlanImages?.length > 0 && (
                    <div className="flex overflow-x-auto gap-3 w-full py-3">
                        {currentPlan?.floorPlanImages?.map((img, index) => (
                            <div
                                key={index}
                                className="relative flex-shrink-0 w-32 h-32 border rounded-md overflow-hidden"
                            >
                                <img
                                    src={img}
                                    alt={`floor-plan-${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border hover:bg-gray-50 cursor-pointer transition-all duration-300 flex flex-row gap-2 justify-center items-center bg-gray-100 rounded-sm mt-2 ${currentPlan.floorPlanImages.length ? "h-[40px]" : "h-[100px]"
                        }`}
                >
                    <Upload size={18} />
                    <h1 className="text-sm font-medium text-black">
                        Upload {currentPlan.floorPlanImages.length ? "More" : ""} Images
                    </h1>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            <ButtonCommon title="Submit" onClick={handleSubmit} />
        </div>
    );
};

export default FloorPlanningPricing;