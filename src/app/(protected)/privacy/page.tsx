import React from 'react';

const PrivacyPolicyData = [
    {
        title: "Data Collection",
        description1: "We only collect information that is necessary to provide you with the best experience.",
        description2: "Personal details (like name, phone number, and email) are stored securely and never sold to third parties.",
    },
    {
        title: "Data Usage",
        description1: "Information shared is used only for property inquiries, communication, and enhancing your user experience.",
        description2: "Your details are visible only to authorized builders/agents you connect with.",
    },
    {
        title: "Data Protection",
        description1: "All sensitive data is encrypted during transfer and storage.",
        description2: "We regularly update our security systems to protect against unauthorized access.",
    },
    {
        title: "User Responsibility",
        description1: "Do not share passwords, OTPs, or confidential details with anyone claiming to be from our team.",
        description2: "Always verify property details and deal only with verified agents/builders listed on the platform.",
    },
    {
        title: "Safety in Transactions",
        description1: "Payments should be made only through trusted and verified channels.",
        description2: "We are not responsible for offline cash dealings between users and builders/agents.",
    },
    {
        title: "Content Safety",
        description1: "Any inappropriate, fake, or misleading property listings will be removed immediately.",
        description2: "Users posting false information may face suspension or permanent ban.",
    },
    {
        title: "Transparency & Control",
        description1: "You can request data deletion anytime from your account settings.",
        description2: "Notifications and data-sharing preferences can be customized by you.",
    },
    {
        title: "Reporting & Support",
        description1: "If you find any suspicious activity, report it directly through the app.",
        description2: "Our support team is available to assist with any safety or privacy concerns.",
    },
];

const PrivacyPolicy = () => {
    return (
        <div className="h-full overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        Legal and Policies
                    </h1>
                    <div className="flex items-center space-x-2">
                        {/* Placeholder for potential icons/buttons */}
                        <span className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="space-y-6">
                    {PrivacyPolicyData.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {item.title}
                            </h2>
                            <div className="space-y-3">
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                    {item.description1}
                                </p>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                    {item.description2}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;