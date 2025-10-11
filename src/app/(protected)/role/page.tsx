"use client";

import { motion, AnimatePresence } from "framer-motion";
import AgentBuilderProfileForm from "@/components/AgentBuilderProfileForm/AgentBuilderProfileForm";
import SelectRole from "@/components/AgentBuilderProfileForm/SelectRole";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import buildersAnimation from '../../../assets/lotties/D360 Hero.json'
import agentAnimation from '../../../assets/lotties/fast man.json'
import { http } from "@/lib/http";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";


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
    const [showSuccess, setShowSuccess] = useState(false)
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
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const handleSubmit = async () => {
        console.log(formData);
        const payload = {
            builderName: formData.builderName,
            companyName: formData.companyBrandName,
            logoUrl: formData.photo,
            yearsOfOperation: Number(formData.yearsOfOperation),
            totalProjects: Number(formData.totalProjects),
            projectsCompleted: Number(formData.projectsCompleted),
            projectsOngoing: Number(formData.projectsOngoing),
            address: formData.address,
            builderDescription: formData.builderDescription,
            contactPerson: formData.primaryContactPersonName,
            contactEmail: formData.email,
            contactPhone: formData.contactNumber,
            alternatePhone: formData.alternateNumber,
            operatingCities: formData.localitiesOfOperation,
        };

        const payload2 = {
            agentName: formData.agentName,
            companyName: formData.companyBrandName,
            profilePicture: formData.profilePhoto,
            reraNumber: formData.reraNumber,
            operatingSince: Number(formData.operatingSince),
            dealsClosed: Number(formData.dealClosed),
            dealsIn: formData.dealsIn,
            primaryContactNumber: formData.contactNumber,
            alternateContactNumber: formData.alternateNumber,
            localitiesOfOperation: formData.localitiesOfOperation,
            cityState: `${formData.city}, ${formData.state}`,
            officeAddress: formData.officeAddress,
            idProofUrl: formData.IDProof,
            contactEmail: formData.email,
        };

        try {
            setLoadingSubmit(true);
            let response;
            if (role === "builder") {
                response = await http.post(`/builders`, payload);
                handleSubmitRole("Builder")
                setShowSuccess(true)
            } else {
                response = await http.post(`/agents`, payload2);
                handleSubmitRole("Agent")

                setShowSuccess(true)
            }
            console.log("responseee", response);

        } catch (error: any) {
            console.log("Something went wrong", error.response);
        } finally {
            setLoadingSubmit(false);
        }
    }

    const handleSubmitRole = async (role: any) => {
        try {
            const response = http.post(`users/roles/${role}`);
            await handleSubmit();
        } catch (error: any) {
            console.log("Error in handleNext:", error);
        }
    };

    return (
        <div className="h-full flex items-center justify-center">

            {
                showSuccess ?
                    <FormSubmissionSuccess />
                    :
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
                                className="flex flex-col w-full h-full "
                            >
                                <div className="flex flex-row  h-full ">
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex flex-1 overflow-auto  h-full  px-8 py-10">
                                            <AgentBuilderProfileForm
                                                errors={errors}
                                                formData={formData}
                                                handleInputChange={handleInputChange}
                                                selectedTrue={selectedTrue}
                                                setSelectedTrue={setSelectedTrue}
                                                role={role ?? ""}
                                            />

                                        </div>
                                        <button
                                            onClick={handleSubmit}
                                            className="cursor-pointer mb-10 mx-8 bg-black text-white text-[15px] rounded-md h-10 mt-5 font-medium disabled:bg-gray-200 disabled:text-gray-400"
                                        >
                                            {loadingSubmit ? "Submitting..." : "Continue"}
                                        </button>
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

                            </motion.div>
                        )}
                    </AnimatePresence>
            }
        </div>
    );
};

export default Role;


const FormSubmissionSuccess: React.FC = () => {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/property-listing');
        }, 3000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center h-full w-full justify-center  px-6 bg-white text-center">
            {/* ✅ Checkmark Animation */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8"
            >
                <CheckCircle2 className="w-16 h-16 text-green-600" />
            </motion.div>

            {/* ✅ Title and Subtitle */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-md space-y-4"
            >
                <h1 className="text-2xl font-semibold text-gray-800">
                    Application Submitted Successfully!
                </h1>
                <p className="text-gray-600 leading-relaxed">
                    Thank you for your interest in joining <span className="font-medium text-blue-600">Listify</span>.
                    Our team will review your application and share updates via email soon.
                </p>
            </motion.div>

            {/* ✅ Contact Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-gray-500"
            >
                <p>Feel free to contact us</p>
                <p className="text-blue-600 font-medium">support@listify.com</p>
            </motion.div>

            {/* ✅ CTA Button */}
            <motion.button
                onClick={() => router.replace('/dashboard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mt-10 flex cursor-pointer items-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800"
            >
                Learn More About Listify
                <ArrowRight className="w-4 h-4" />
            </motion.button>
        </div>
    );
};