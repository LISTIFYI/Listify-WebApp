"use client"

import { useAuth } from '@/context/AuthContext';
import { ChevronRight, User, Calendar, Settings, Star, Lock, Users, ShieldCheck, Book, TrendingUp, AlertCircle, HelpCircle, CircleAlert, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Define interface for list items
interface ListItem {
  id: string;
  title: string;
  icon: string;
  link?: string;
  externalLink?: string;
  action?: string;
}

const SettingPage: React.FC = () => {

  const { isAdmin, toggleAdminMode, user, role } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const profileList: ListItem[] = [
    { id: "1", title: "Profile", icon: "personIcon", link: "/profile" },
    { id: "2", title: "Calendar", icon: "calendarIcon", link: `${isAdmin ? "/admin-calendar" : "/calendar"}` },
    // { id: "3", title: "Settings", icon: "settingsIcon", link: "/settings" },
    { id: "7", title: "Subscriptions", icon: "starIcon", link: "/subscriptions" },
    { id: "8", title: "Privacy and Safety", icon: "lockIcon", link: "/privacy" },
    { id: "6", title: `${loading ? "Switching" : "Switch"} to ${isAdmin ? "User" : "Admin"}`, icon: "twoPersonIcon", link: "/switch" },
  ];

  const generalList: ListItem[] = [
    { id: "2", title: "Listifyi Verified", icon: "verifiedIcon", link: "/listifyi-verification" },
    { id: "4", title: "Listify Guidelines", icon: "bookIcon", link: "/listifyi-guidelines" },
    { id: "5", title: "Sales Enquiry", icon: "increaseIcon", link: "#" },
  ];

  const supportList: ListItem[] = [
    { id: "1", title: "Report a Problem", icon: "reportIcon", link: "/report-problem" },
    { id: "2", title: "Help Center", icon: "circleQuestionIcon", link: "/help-center" },
    { id: "3", title: "FAQ", icon: "circleExclamation", link: "/faq" },
    {
      id: "4",
      title: "Rate Us on Google Play",
      icon: "reviewStar",
      externalLink: "https://play.google.com/store/apps/details?id=com.instagram.android",
    },
    { id: "5", title: "Logout", icon: "logoutIcon", action: "logout" },
  ];

  // Map icon strings to lucide-react components
  const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string, className: string }>> = {
    personIcon: User,
    calendarIcon: Calendar,
    settingsIcon: Settings,
    starIcon: Star,
    lockIcon: Lock,
    twoPersonIcon: Users,
    verifiedIcon: ShieldCheck,
    bookIcon: Book,
    increaseIcon: TrendingUp,
    reportIcon: AlertCircle,
    circleQuestionIcon: HelpCircle,
    circleExclamation: CircleAlert,
    reviewStar: Star,
    logoutIcon: LogOut,
  };

  return (
    <div className="h-full py-4 flex flex-col overflow-y-auto">
      <div className="px-4 pb-6 border-b">
        <h1 className="text-[16px] md:text-[15px] lg:text-[15px] font-bold text-[#86878B]">ACCOUNT</h1>
        <div className="flex flex-col px-2">
          {profileList.map((item) => {
            const IconComponent = iconMap[item.icon];
            return (
              <div
                key={item.id}
                className="flex flex-row justify-between items-center py-2 md:py-3 lg:py-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                onClick={() => {
                  if (item.link === "/switch") {
                    if (!role) {
                      router.push("/role")
                    } else {
                      setLoading(true)
                      toggleAdminMode()
                      setTimeout(() => {
                        if (!isAdmin) {
                          router.push("/dashboard")
                        } else {
                          router.push("/")
                        }
                        setLoading(false)
                      }, 1000);

                    }
                  } else {
                    router.push(String(item.link))
                  }
                }}
              >
                <div className="flex flex-row items-center gap-2">
                  <IconComponent className="size-5 md:size-4 lg:size-4" color="#000" />
                  <p className="text-[16px] md:text-[14px] lg:text-[14px] text-black font-[400]">{item.title}</p>
                </div>
                <ChevronRight size={24} color="#000" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-4 py-6 border-b">
        <h1 className="text-[16px] md:text-[15px] lg:text-[15px] font-bold text-[#86878B]">FEATURES</h1>
        <div className="flex flex-col px-2">
          {generalList.map((item) => {
            const IconComponent = iconMap[item.icon];
            return (
              <div
                onClick={() => {
                  router.push(String(item.link))
                }}
                key={item.id}
                className="flex flex-row justify-between items-center py-2 md:py-3 lg:py-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                <div className="flex flex-row items-center gap-2">
                  <IconComponent className="size-5 md:size-4 lg:size-4" color="#000" />
                  <p className="text-[16px] md:text-[14px] lg:text-[14px] text-black font-[400]">{item.title}</p>
                </div>
                <ChevronRight size={24} color="#000" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-4 pt-6">
        <h1 className="text-[16px] md:text-[15px] lg:text-[15px] font-bold text-[#86878B]">SUPPORT</h1>
        <div className="flex flex-col px-2">
          {supportList.map((item) => {
            const IconComponent = iconMap[item.icon];
            return (
              <div
                key={item.id}
                className="flex flex-row justify-between items-center py-2 md:py-3 lg:py-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                <div className="flex flex-row items-center gap-2">
                  <IconComponent className="size-5 md:size-4 lg:size-4" color={item.action === "logout" ? "#DC2626" : "#000"} />
                  <p
                    className={`text-[16px] md:text-[14px] lg:text-[14px] font-[400] ${item.action === "logout" ? "text-red-600" : "text-black"
                      }`}
                  >
                    {item.title}
                  </p>
                </div>
                <ChevronRight size={24} color="#000" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingPage;