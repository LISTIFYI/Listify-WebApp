import React from 'react';
import { format } from 'date-fns';
import { ChevronDown, MapPin, DollarSign, Image as ImageIcon, Video, FileText } from 'lucide-react';



const ListingPreview = () => {
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
    const [isAmenitiesOpen, setIsAmenitiesOpen] = React.useState(false);

    // Demo data (replace with actual formData when available)
    const demoData = {
        entityType: "Apartment",
        listingType: "builder",
        title: "Luxury 3BHK Apartment in Whitefield",
        description: "A spacious and modern 3BHK apartment with premium amenities, located in the heart of Whitefield. Perfect for families seeking comfort and convenience.",
        details: {
            approvals: ["BBMP", "RERA"],
            possessionDate: format(new Date(2026, 0, 1), 'yyyy-MM-dd'), // January 1, 2026
            propertyCategory: "Under Construction",
            totalUnits: 120,
            reraNumber: "RERA123456",
            facing: "East",
            bhkType: "3 BHK",
            priceRange: "$200,000 - $250,000",
            towers: 3,
            purpose: "Sale",
            certification: "IGBC Gold",
            area: 1500,
            totalFloors: 15,
            ageOfProperty: "New",
            furnished: "Semi-Furnished",
            floor: 7,
            sampleFlatAvailable: true,
            additionalRooms: ["Study Room", "Servant Room"],
            loanApprovedBanks: ["HDFC", "ICICI", "SBI"],
            bedrooms: 3,
            bathrooms: 2,
            balconies: 1,
            floorPlanningPricing: ["$50/sqft", "$60/sqft"],
            propertyType: "Apartment",
            reraRegistered: true,
            coveredParking: true,
            ownership: "Freehold",
            greenQuality: "Eco-Friendly",
        },
        location: {
            address: "123 Green Valley, Whitefield",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560066",
            coordinates: [12.9754666, 77.6328723],
            landmarks: "Near ITPL, Opposite Forum Mall",
        },
        pricing: {
            type: "Sale",
            pricePerSqft: 4500,
            amount: 6750000,
            negotiable: true,
            maintenanceCharges: 3000,
        },
        amenities: ["Swimming Pool", "Gym", "Security", "Park", "Clubhouse"],
        tags: ["Luxury", "New Launch", "Family", "Investment"],
        availableOffers: ["5% Discount on Booking", "Free Parking"],
        status: "pending_approval",
        featured: false,
        contact: {
            name: "John Doe",
            phone: "+91-9876543210",
            email: "john.doe@example.com",
            whatsapp: "+91-9876543210",
            isAgent: false,
            agentId: "agent123",
        },
        additionalContacts: [
            { name: "Jane Smith", phone: "+91-8765432109", email: "jane.smith@example.com" },
        ],
        media: {
            images: [
                "https://via.placeholder.com/300x200?text=Image1",
                "https://via.placeholder.com/300x200?text=Image2",
            ],
            videos: ["https://via.placeholder.com/300x200?text=Video1.mp4"],
            floorPlan: ["https://via.placeholder.com/300x200?text=FloorPlan.pdf"],
        },
    };

    return (
        <div className="max-w-5xl mx-auto bg-gray-50 shadow-xl rounded-xl p-8 border border-gray-200">
            {/* Header Section */}
            <div className="border-b-2 border-gray-200 pb-6 mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{demoData.title}</h1>
                <div className="flex items-center gap-4 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {demoData.entityType}
                    </span>
                    <span className="text-sm text-gray-600">Listed by: {demoData.listingType}</span>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-500" /> Media Gallery
                </h2>
                <div className="relative w-full overflow-hidden">
                    <div className="flex gap-4 animate-scroll">
                        {demoData.media.images.concat(demoData.media.videos).map((media, index) => (
                            <div key={index} className="w-80 h-48 flex-shrink-0">
                                {media.includes('.mp4') ? (
                                    <video controls className="w-full h-full object-cover rounded-lg shadow-md">
                                        <source src={media} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <img src={media} alt={`Media ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-2 flex gap-4">
                    {demoData.media.floorPlan.map((plan, index) => (
                        <a
                            key={index}
                            href={plan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            <FileText className="w-5 h-5" /> Floor Plan {index + 1}
                        </a>
                    ))}
                </div>
            </div>

            {/* Description Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    Description
                </h2>
                <p className="text-gray-600 leading-relaxed bg-white p-4 rounded-lg shadow-inner">{demoData.description}</p>
            </div>

            {/* Property Details Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    Property Details <button onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="ml-2 text-gray-500 hover:text-gray-700">
                        <ChevronDown className={`w-5 h-5 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                    </button>
                </h2>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ${isDetailsOpen ? 'max-h-[1000px]' : 'max-h-0 overflow-hidden'}`}>
                    <div className="space-y-2">
                        <p className="text-gray-700"><strong>Category:</strong> {demoData.details.propertyCategory}</p>
                        <p className="text-gray-700"><strong>Possession Date:</strong> {demoData.details.possessionDate}</p>
                        <p className="text-gray-700"><strong>Total Units:</strong> {demoData.details.totalUnits}</p>
                        <p className="text-gray-700"><strong>RERA Number:</strong> {demoData.details.reraNumber}</p>
                        <p className="text-gray-700"><strong>Facing:</strong> {demoData.details.facing}</p>
                        <p className="text-gray-700"><strong>BHK Type:</strong> {demoData.details.bhkType}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-gray-700"><strong>Towers:</strong> {demoData.details.towers}</p>
                        <p className="text-gray-700"><strong>Purpose:</strong> {demoData.details.purpose}</p>
                        <p className="text-gray-700"><strong>Certification:</strong> {demoData.details.certification}</p>
                        <p className="text-gray-700"><strong>Area (sqft):</strong> {demoData.details.area}</p>
                        <p className="text-gray-700"><strong>Total Floors:</strong> {demoData.details.totalFloors}</p>
                        <p className="text-gray-700"><strong>Age:</strong> {demoData.details.ageOfProperty}</p>
                    </div>
                    {isDetailsOpen && (
                        <>
                            <div className="space-y-2">
                                <p className="text-gray-700"><strong>Furnished:</strong> {demoData.details.furnished}</p>
                                <p className="text-gray-700"><strong>Floor:</strong> {demoData.details.floor}</p>
                                <p className="text-gray-700"><strong>Sample Flat:</strong> {demoData.details.sampleFlatAvailable ? 'Yes' : 'No'}</p>
                                <p className="text-gray-700"><strong>Additional Rooms:</strong> {demoData.details.additionalRooms.join(', ') || 'N/A'}</p>
                                <p className="text-gray-700"><strong>Loan Banks:</strong> {demoData.details.loanApprovedBanks.join(', ') || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-700"><strong>Bedrooms:</strong> {demoData.details.bedrooms || 'N/A'}</p>
                                <p className="text-gray-700"><strong>Bathrooms:</strong> {demoData.details.bathrooms || 'N/A'}</p>
                                <p className="text-gray-700"><strong>Balconies:</strong> {demoData.details.balconies || 'N/A'}</p>
                                <p className="text-gray-700"><strong>Floor Plans Pricing:</strong> {demoData.details.floorPlanningPricing.join(', ') || 'N/A'}</p>
                                <p className="text-gray-700"><strong>Property Type:</strong> {demoData.details.propertyType}</p>
                                <p className="text-gray-700"><strong>RERA Registered:</strong> {demoData.details.reraRegistered ? 'Yes' : 'No'}</p>
                                <p className="text-gray-700"><strong>Covered Parking:</strong> {demoData.details.coveredParking ? 'Yes' : 'No'}</p>
                                <p className="text-gray-700"><strong>Ownership:</strong> {demoData.details.ownership}</p>
                                <p className="text-gray-700"><strong>Green Quality:</strong> {demoData.details.greenQuality}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Location Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" /> Location
                </h2>
                <div className="bg-white p-4 rounded-lg shadow-inner space-y-2">
                    <p className="text-gray-700"><strong>Address:</strong> {demoData.location.address}</p>
                    <p className="text-gray-700"><strong>City:</strong> {demoData.location.city}</p>
                    <p className="text-gray-700"><strong>State:</strong> {demoData.location.state}</p>
                    <p className="text-gray-700"><strong>Pincode:</strong> {demoData.location.pincode}</p>
                    <p className="text-gray-700"><strong>Coordinates:</strong> [{demoData.location.coordinates[0]}, {demoData.location.coordinates[1]}]</p>
                    <p className="text-gray-700"><strong>Landmarks:</strong> {demoData.location.landmarks}</p>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-500" /> Pricing
                </h2>
                <div className="bg-white p-4 rounded-lg shadow-inner space-y-2">
                    <p className="text-gray-700"><strong>Type:</strong> {demoData.pricing.type || 'N/A'}</p>
                    <p className="text-gray-700"><strong>Price per Sqft:</strong> ₹{demoData.pricing.pricePerSqft.toLocaleString()}</p>
                    <p className="text-gray-700"><strong>Total Amount:</strong> ₹{demoData.pricing.amount.toLocaleString()}</p>
                    <p className="text-gray-700"><strong>Negotiable:</strong> {demoData.pricing.negotiable ? 'Yes' : 'No'}</p>
                    <p className="text-gray-700"><strong>Maintenance Charges:</strong> ₹{demoData.pricing.maintenanceCharges.toLocaleString()}</p>
                </div>
            </div>

            {/* Amenities & Tags Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    Amenities & Tags <button onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)} className="ml-2 text-gray-500 hover:text-gray-700">
                        <ChevronDown className={`w-5 h-5 transition-transform ${isAmenitiesOpen ? 'rotate-180' : ''}`} />
                    </button>
                </h2>
                <div className={`transition-all duration-300 ${isAmenitiesOpen ? 'max-h-[500px]' : 'max-h-0 overflow-hidden'}`}>
                    <div className="bg-white p-4 rounded-lg shadow-inner">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {demoData.amenities.map((amenity, index) => (
                                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {amenity}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {demoData.tags.map((tag, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <p className="mt-4 text-gray-700"><strong>Available Offers:</strong> {demoData.availableOffers.join(', ') || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Contact</h2>
                <div className="bg-white p-4 rounded-lg shadow-inner space-y-2">
                    <p className="text-gray-700"><strong>Name:</strong> {demoData.contact.name}</p>
                    <p className="text-gray-700"><strong>Phone:</strong> {demoData.contact.phone}</p>
                    <p className="text-gray-700"><strong>Email:</strong> {demoData.contact.email}</p>
                    <p className="text-gray-700"><strong>WhatsApp:</strong> {demoData.contact.whatsapp}</p>
                    <p className="text-gray-700"><strong>Is Agent:</strong> {demoData.contact.isAgent ? 'Yes' : 'No'}</p>
                    <p className="text-gray-700"><strong>Agent ID:</strong> {demoData.contact.agentId}</p>
                </div>
            </div>

            {/* Additional Contacts Section */}
            {demoData.additionalContacts.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Additional Contacts</h2>
                    <div className="bg-white p-4 rounded-lg shadow-inner space-y-4">
                        {demoData.additionalContacts.map((contact, index) => (
                            <div key={index} className="space-y-2">
                                <p className="text-gray-700"><strong>Name:</strong> {contact.name}</p>
                                <p className="text-gray-700"><strong>Phone:</strong> {contact.phone}</p>
                                <p className="text-gray-700"><strong>Email:</strong> {contact.email}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Status Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                    Status: {demoData.status} | Featured: {demoData.featured ? 'Yes' : 'No'}
                </p>
            </div>
        </div>
    );
};

export default ListingPreview;