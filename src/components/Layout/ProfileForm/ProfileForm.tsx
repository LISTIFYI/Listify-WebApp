"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Pencil, X } from "lucide-react";
import { UploadPhoto } from "@/utils/api";
import Logo from '../../../assets/logo.png'
import { initializeApi } from "@/lib/http";
import { tokenStore } from "@/lib/token";


export default function ProfileForm({
    open,
    setOpen,
    selectedId,
    getProfileFn
}: {
    open: boolean;
    setOpen: (val: boolean) => void;
    selectedId: string;
    getProfileFn: any
}) {

    const api = initializeApi(tokenStore).getApi();

    const [formData, setFormData] = useState<any>({
        profilePhoto: "",
        name: "",
        bio: "",
        email: "",
        phone: "",
        address: "",
        gender: "",
        age: "",
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleGenderChange = (value: string) => {
        setFormData((prev: any) => ({ ...prev, gender: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form data:", formData);
        try {
            const tk = tokenStore.get();
            const res = await api.put(`/users/profile`,
                {
                    profilePhoto: formData.profile_pic,
                    name: formData.name,
                    bio: formData.bio,
                    email: formData.email,
                    // mobileNumber: formData.phone, // API uses mobileNumber
                    address: formData.address,
                    gender: formData.gender,
                    age: Number(formData.age) || null,

                },
            );
            await getProfile()
            await getProfileFn()
        } catch (error) {

        }
        setOpen(false);
    };

    const getProfile = async () => {
        try {
            const tk = tokenStore.get();
            const res = await api.get<any>(`/users/profile/${selectedId}`);
            console.log("ss", res);

            if (res.data) {
                setFormData({
                    profilePhoto: res.data?.profilePhoto || "",
                    name: res.data.name || "",
                    bio: res.data.bio || "",
                    email: res.data.email || "",
                    phone: res.data.mobileNumber || "",
                    address: res.data.address || "",
                    gender: res.data.gender || "",
                    age: res.data.age?.toString() || "",

                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const uploadProfilePhoto = async (file: any) => {
        const tk = tokenStore.get();
        const payload = {
            entity: "POST",
            fileExtension: file.type.split("/")?.pop(),
            type: "IMAGE",
            name: file?.name.split(".")[0]
        };
        const res = await UploadPhoto(payload, tk?.accessToken ?? "", file, "image")

        if (res.fileUrl) {
            await api.put(`/users/profile`,
                { profilePhoto: res.fileUrl });
            await getProfile()
            await getProfileFn()
        }

    }

    useEffect(() => {
        if (selectedId) {
            getProfile();
        }
    }, [selectedId, open]);
    console.log(formData);


    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent className="sm:max-w-lg pt-0 pb-6 px-0" showCloseButton={false}>
                <div className='flex flex-row justify-between items-center p-4 pb-3 border-b'>
                    <div className='flex flex-row gap-2'>
                        <Image src={Logo} alt="logo" className="max-w-[30px] h-[30px] border " />
                        <h1 className='text-[22px]  text-black font-[700] text-nowrap  text-start'>Edit Profile</h1>
                    </div>
                    <div
                        onClick={() => {
                            setOpen(false)
                        }}
                        className='flex border cursor-pointer ml-auto border-slate-300  hover:bg-gray-50 transition-all duration-300 rounded-full w-[32px] h-[32px] justify-center items-center '>
                        <X size={22} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-6">
                    <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto">
                        {/* Profile Picture */}
                        <div className="w-full h-full rounded-full overflow-hidden border flex justify-center items-center">
                            {formData?.profilePhoto && formData?.profilePhoto.trim() !== "" ? (
                                <Image
                                    src={formData.profilePhoto}
                                    alt="Profile picture"
                                    className="rounded-full object-cover"
                                    fill
                                    sizes="(max-width: 640px) 96px, 128px"
                                />
                            ) : (
                                <span className="text-3xl sm:text-5xl font-semibold text-gray-700">
                                    {formData?.name?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                            )}
                        </div>

                        {/* Pencil Icon Button */}
                        <button
                            type="button"
                            className="absolute cursor-pointer bottom-1 right-0 bg-white rounded-full w-[28px] h-[28px] flex justify-center items-center border  hover:bg-gray-100"
                            onClick={() => {
                                // trigger file input or open upload modal
                                document.getElementById("profilePicInput")?.click();
                            }}
                        >
                            <Pencil className="w-4 h-4 text-gray-600" />
                        </button>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            id="profilePicInput"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // handle upload (preview or send to API)
                                    uploadProfilePhoto(file)
                                }
                            }}
                        />
                    </div>
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-row gap-4">

                        <div className="flex flex-1 flex-col">
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-1 flex-col">
                            <label className="block text-sm font-medium">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            // disabled={!!formData.phone}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={2}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Gender (shadcn Select) */}
                    <div className="flex flex-row gap-4">
                        <div className="flex flex-1 flex-col">
                            <label className="block text-sm font-medium">Gender</label>
                            <Select
                                value={formData.gender}
                                onValueChange={handleGenderChange}
                            >
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue placeholder="Select gender..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Age */}
                        <div className="flex flex-1 flex-col">
                            <label className="block text-sm font-medium">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                    </div>
                    {/* Footer */}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
