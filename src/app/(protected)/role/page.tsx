"use client";

import { motion, AnimatePresence } from "framer-motion";
import AgentBuilderProfileForm from "@/components/AgentBuilderProfileForm/AgentBuilderProfileForm";
import SelectRole from "@/components/AgentBuilderProfileForm/SelectRole";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import Lottie from "lottie-react";
import buildersAnimation from '../../../assets/lotties/construction.json'
import agentAnimation from '../../../assets/lotties/fast man.json'


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
    const { role, setRoleGlobally } = useAuth();
    console.log("empty role or something", role);

    const [selectedTrue, setSelectedTrue] = useState(false);

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
    console.log(role);

    return (
        <div className="h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
                {!selectedTrue ? (
                    <motion.div
                        key="selectRole"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full flex justify-center"
                    >
                        <SelectRole
                            selectedTrue={selectedTrue}
                            setSelectedTrue={setSelectedTrue}
                            role={role ?? ""}
                            setRoleGlobally={setRoleGlobally}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="formSection"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="flex flex-col w-full  "
                    >
                        <div className="flex flex-row">
                            <div className="flex flex-1 px-6 overflow-auto">
                                <AgentBuilderProfileForm
                                    errors={errors}
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    selectedTrue={selectedTrue}
                                    setSelectedTrue={setSelectedTrue}
                                    role={role ?? ""}
                                />

                            </div>
                            <motion.div
                                initial={{ opacity: 0, x: 80 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 80 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="hidden  lg:flex flex-1 border-l bg-gray-50 px-8 py-10 flex-col justify-center items-center"
                            >
                                <div className="max-w-md space-y-6">
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        {role === "builder"
                                            ? "Build Your Brand, Project by Project"
                                            : "Grow Your Real Estate Network"}
                                    </h2>

                                    <p className="text-gray-600 text-[15px] leading-relaxed">
                                        {role === "builder"
                                            ? "Showcase your projects, highlight your expertise, and connect directly with trusted agents and serious buyers."
                                            : "Complete your profile to connect with verified builders, access premium listings, and grow your client network."}
                                    </p>

                                    <div className="">
                                        <Lottie
                                            animationData={role === "builder" ? buildersAnimation : agentAnimation}
                                            loop
                                            autoplay
                                            className="w-60 h-60 mx-auto"
                                        />
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className={`mt-10 p-4 rounded-lg shadow-sm border ${role === "builder"
                                            ? "bg-yellow-50 border-yellow-200"
                                            : "bg-blue-50 border-blue-200"
                                            }`}
                                    >
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                            {role === "builder" ? "🏗️ Pro Tip" : "🤝 Pro Tip"}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {role === "builder"
                                                ? "A detailed project portfolio attracts serious buyers and top agents."
                                                : "Complete your profile to increase trust and secure better collaborations."}
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                        <button
                            className="cursor-pointer w-[40%] ml-15 bg-black text-white text-[15px] rounded-md h-[42px] mt-5 font-medium disabled:bg-gray-200 disabled:text-gray-400"
                        >
                            Continue
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Role;
