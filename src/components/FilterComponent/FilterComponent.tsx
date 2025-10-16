"use client";

import React, { useState, useRef, useEffect } from 'react';
import ButtonCommon from '../CustomFields/Button';
import { useAuth } from '@/context/AuthContext';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';

interface Tab2 {
    id: string;
    name: string;
    isDisable?: boolean;
    isComing?: boolean;
}

const FilterComponent: React.FC = () => {
    const { addFilters, removeAllFilters, setOpenFilter } = useAuth()
    const [activeTab, setActiveTab] = useState<string>('Flat');
    const [activeTab2, setActiveTab2] = useState<string>('Commercial');
    const [borderStyle, setBorderStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const tabs: string[] = ['Flat', 'Villa', 'Plot'];
    const tabs2: Tab2[] = [
        {
            id: '1',
            name: 'Commercial',
        },
        {
            id: '2',
            name: 'Residential',
            isDisable: true,
            isComing: true,
        },
    ];

    const bedroom: string[] = ['1 BHK', '2 BHK', '3 BHK', "4+ BHK"];


    useEffect(() => {
        const activeIndex = tabs.indexOf(activeTab);
        const activeTabElement = tabRefs.current[activeIndex];
        if (activeTabElement && containerRef.current) {
            const { offsetWidth } = activeTabElement;
            const containerLeft = containerRef.current.getBoundingClientRect().left;
            const tabLeft = activeTabElement.getBoundingClientRect().left;
            setBorderStyle({
                left: tabLeft - containerLeft,
                width: offsetWidth,
            });
        }
    }, [activeTab]);

    const bedrooms: string[] = ['1 BHK', '2 BHK', '3 BHK', '4+BHK'];
    const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>([]);

    const buildingTypes: string[] = ['Apartment', 'Builder Floor', 'Penthouse', 'Studio House'];
    const [selectedBuildingTypes, setSelectedBuildingTypes] = useState<string[]>([]);

    const projectStatuses: string[] = ['New Construction', 'Ready to Move', 'Resale'];
    const [selectedProjectStatuses, setSelectedProjectStatuses] = useState<string[]>([]);

    const furnishingStatuses: string[] = ['Furnished', 'Semi Furnished', 'Unfurnished'];
    const [selectedFurnishingStatuses, setSelectedFurnishingStatuses] = useState<string[]>([]);

    const facings: string[] = ['East', 'West', 'North', 'South', 'North East', 'North West', 'South East', 'South West'];
    const [selectedFacings, setSelectedFacings] = useState<string[]>([]);


    const plotType: string[] = ['Residential Plot', 'Farm Land', 'Gated Community Plot', 'Corner Plot', "Commercial Land"];
    const [selectedPlotType, setSelectedPlotType] = useState<string[]>([]);

    const approvalAuthority: string[] = ["BDA", 'BBMP', 'DTCP', 'Panchayat', 'No Approval'];
    const [selectedAuthority, setSelectedAuthority] = useState<string[]>([]);

    const toggleBedroom = (bedroom: string) => {
        setSelectedBedrooms(prev =>
            prev.includes(bedroom)
                ? prev.filter(item => item !== bedroom)
                : [...prev, bedroom]
        );
    };

    const toggleBuildingType = (buildingType: string) => {
        setSelectedBuildingTypes(prev =>
            prev.includes(buildingType)
                ? prev.filter(item => item !== buildingType)
                : [...prev, buildingType]
        );
    };


    const toggleProjectStatus = (status: string) => {
        setSelectedProjectStatuses(prev =>
            prev.includes(status)
                ? prev.filter(item => item !== status)
                : [...prev, status]
        );
    };

    const toggleFurnishingStatus = (status: string) => {
        setSelectedFurnishingStatuses(prev =>
            prev.includes(status)
                ? prev.filter(item => item !== status)
                : [...prev, status]
        );
    };

    const toggleFacing = (facing: string) => {
        setSelectedFacings(prev =>
            prev.includes(facing)
                ? prev.filter(item => item !== facing)
                : [...prev, facing]
        );
    };

    const togglePlotType = (status: string) => {
        setSelectedPlotType(prev =>
            prev.includes(status)
                ? prev.filter(item => item !== status)
                : [...prev, status]
        );
    };

    const toggleApprovalAuthority = (facing: string) => {
        setSelectedAuthority(prev =>
            prev.includes(facing)
                ? prev.filter(item => item !== facing)
                : [...prev, facing]
        );
    };

    const handleSubmit = () => {
        console.log(
            selectedBedrooms,
            selectedBuildingTypes,
            selectedFacings,
            selectedFurnishingStatuses,
            selectedProjectStatuses
        );

        const selectedFilter: any = {
            type: activeTab.toLowerCase(),
            bhkType: selectedBedrooms.length > 0 ? selectedBedrooms.join(',') : '',
            propertyType: selectedBuildingTypes.length > 0 ? selectedBuildingTypes.join(',') : '',
            projectStatus: selectedProjectStatuses.length > 0 ? selectedProjectStatuses.join(',') : '',
            furnishingStatus: selectedFurnishingStatuses.length > 0 ? selectedFurnishingStatuses.join(',') : '',
            facing: selectedFacings.length > 0 ? selectedFacings.join(',') : '',
            plotType: selectedPlotType.length > 0 ? selectedPlotType.join(',') : '',
            approvalAuthority: selectedAuthority.length > 0 ? selectedAuthority.join(',') : '',
        };
        addFilters(selectedFilter);
        setOpenFilter(false)
    };

    const [value, setValue] = useState([25, 75])

    return (
        <div className="p-4 h-full overflow-hidden  flex flex-col gap-4 ">


            <div className="flex h-full flex-col gap-4 overflow-y-auto">
                <div className="flex justify-center flex-row gap-2">
                    {tabs2.map((tab) => (
                        <button
                            disabled={tab.isDisable}
                            key={tab.id}
                            onClick={() => setActiveTab2(tab.name)}
                            className={`relative px-6 flex-1 py-3.5 text-sm rounded-md font-medium transition-colors duration-300
      border border-gray-300
      ${activeTab2 === tab.name
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-black hover:bg-gray-100'}
      disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                            {tab.name}

                            {tab.isComing && (
                                <span className="
        absolute right-0 top-0 md:right-2 md:top-2 lg:right-2 lg:top-2
        text-[10px] font-medium
        bg-gradient-to-r from-yellow-200 to-yellow-400
        text-yellow-800
        px-2 py-[1px]
        rounded-full
        shadow-sm
        border border-yellow-300
        animate-pulse
      ">
                                    Coming Soon
                                </span>
                            )}
                        </button>
                    ))}

                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row relative w-fit" ref={containerRef}>
                        {tabs.map((tab, index) => (
                            <button
                                key={tab}
                                ref={(el) => { tabRefs.current[index] = el; }}
                                onClick={() => {
                                    setSelectedAuthority([])
                                    setSelectedPlotType([])
                                    setSelectedBedrooms([])
                                    setSelectedBuildingTypes([])
                                    setSelectedFurnishingStatuses([])
                                    setSelectedProjectStatuses([])
                                    setSelectedFacings([])
                                    setActiveTab(tab)

                                }}
                                className={`px-6 py-2 text-sm font-medium transition-colors duration-300 ease-in-out z-10 ${activeTab === tab ? 'text-black' : 'text-gray-600 hover:text-black'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                        <div
                            className="absolute bottom-0 h-[2px] bg-black transition-all duration-300 ease-in-out"
                            style={{
                                left: `${borderStyle.left}px`,
                                width: `${borderStyle.width}px`,
                            }}
                        />
                    </div>
                </div>
                {
                    (activeTab === "Plot") &&
                    <>
                        <div className="flex flex-col gap-2 mt-4">
                            <h1 className='text-[16px] font-medium'>Plot Type</h1>

                            <div className="flex flex-row flex-wrap gap-6 w-fit">
                                {plotType.map((plotT, index) => (
                                    <label
                                        key={plotT}
                                        className="flex items-center gap-2 cursor-pointer text-[16px] text-gray-700"
                                    >
                                        <Checkbox
                                            checked={selectedPlotType.includes(plotT)}
                                            onCheckedChange={() => togglePlotType(plotT)}
                                            className='w-[20px] h-[20px] cursor-pointer' />
                                        <span
                                            className={`transition-colors ${selectedPlotType.includes(plotT)
                                                ? "text-black"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            {plotT}
                                        </span>
                                    </label>
                                ))}
                            </div>

                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <h1 className='text-[16px] font-medium'>Approval Authority</h1>

                            <div className="flex flex-row flex-wrap gap-6 w-fit">
                                {approvalAuthority.map((approvalA) => (
                                    <label
                                        className="flex items-center gap-2 cursor-pointer text-[16px] text-gray-700"
                                        key={approvalA}

                                    >
                                        <Checkbox
                                            checked={selectedAuthority.includes(approvalA)}
                                            onCheckedChange={() => toggleApprovalAuthority(approvalA)}
                                            className='w-[20px] h-[20px] cursor-pointer' />
                                        <span
                                            className={`transition-colors ${selectedAuthority.includes(approvalA)
                                                ? "text-black"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            {approvalA}
                                        </span>
                                    </label>
                                ))}
                            </div>


                        </div>
                    </>
                }
                {
                    (activeTab === "Flat" || activeTab === "Villa") &&
                    <>
                        <div className="flex flex-col gap-2 mt-4">
                            <h1 className='text-[16px] font-medium'>Bedrooms</h1>
                            <div className="flex flex-row flex-wrap gap-6 w-fit">
                                {bedrooms.map((bedroom) => (
                                    <label
                                        key={bedroom}
                                        className="flex items-center gap-2 cursor-pointer text-[16px] text-gray-700"
                                    >
                                        <Checkbox
                                            checked={selectedBedrooms.includes(bedroom)}
                                            onCheckedChange={() => toggleBedroom(bedroom)}
                                            className='w-[20px] h-[20px] cursor-pointer' />
                                        <span
                                            className={`transition-colors ${selectedBedrooms.includes(bedroom)
                                                ? "text-black"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            {bedroom}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <h1 className='text-[16px] font-medium'>Building Type</h1>
                            <div className="flex flex-row flex-wrap gap-6 w-fit">
                                {buildingTypes.map((buildingType) => (
                                    <label
                                        key={buildingType}
                                        className="flex items-center gap-2 cursor-pointer text-[16px] text-gray-700"

                                    >
                                        <Checkbox
                                            checked={selectedBuildingTypes.includes(buildingType)}
                                            onCheckedChange={() => toggleBuildingType(buildingType)}
                                            className='w-[20px] h-[20px] cursor-pointer' />
                                        <span
                                            className={`transition-colors ${selectedBuildingTypes.includes(buildingType)
                                                ? "text-black"
                                                : "text-gray-600"
                                                }`}
                                        >
                                            {buildingType}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
                }


                <div className="flex flex-col gap-2 mt-2.5 w-[60%]">
                    <h1 className='text-sm'>Price Range</h1>
                    <Slider
                        value={value}
                        onValueChange={setValue}
                        max={100}
                        step={1}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Min: {value[0]}</span>
                        <span>Max: {value[1]}</span>
                    </div>
                </div>
                <div className="w-[60%] space-y-3">

                </div>

                {
                    (activeTab === "Flat" || activeTab === "Villa") &&
                    <div className="flex flex-col gap-2 mt-4">
                        <h1 className='text-[16px] font-medium'>Project Status</h1>
                        <div className="flex flex-row flex-wrap gap-6 w-fit">
                            {projectStatuses.map((status) => (
                                <label
                                    className="flex items-center gap-2 cursor-pointer text-[16px] text-gray-700"
                                    key={status}

                                >
                                    <Checkbox
                                        checked={selectedProjectStatuses.includes(status)}
                                        onCheckedChange={() => toggleProjectStatus(status)}
                                        className='w-[20px] h-[20px] cursor-pointer' />
                                    <span
                                        className={`transition-colors ${selectedProjectStatuses.includes(status)
                                            ? "text-black"
                                            : "text-gray-600"
                                            }`}
                                    >
                                        {status}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                }

                {
                    (activeTab === "Flat" || activeTab === "Villa") &&
                    <div className="flex flex-col gap-2 mt-4">
                        <h1 className='text-[16px] font-medium'>Furnishing Status</h1>
                        <div className="flex flex-row flex-wrap gap-6 w-fit">
                            {furnishingStatuses.map((status) => (
                                <label
                                    className="flex items-center gap-2 cursor-pointer text-[16px] text-gray-700"
                                    key={status}

                                >
                                    <Checkbox
                                        checked={selectedFurnishingStatuses.includes(status)}
                                        onCheckedChange={() => toggleFurnishingStatus(status)}
                                        className='w-[20px] h-[20px] cursor-pointer' />
                                    <span
                                        className={`transition-colors  ${selectedFurnishingStatuses.includes(status)
                                            ? "text-black"
                                            : "text-gray-600"
                                            }`}
                                    >
                                        {status}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                }

                {/* Facing Section */}
                <div className="flex flex-col gap-2 mt-4">
                    <h1 className='text-[16px] font-medium'>Facing</h1>

                    <div className="flex flex-row flex-wrap gap-6 w-fit">
                        {facings.map((facing) => (
                            <label
                                className="flex items-center gap-2 cursor-pointer text-[16px] text-gray-700"
                                key={facing}

                            >
                                <Checkbox className='w-[20px] h-[20px] cursor-pointer'
                                    checked={selectedFacings.includes(facing)}
                                    onCheckedChange={() => toggleFacing(facing)}
                                />


                                <span
                                    className={`transition-colors   ${selectedFacings.includes(facing)
                                        ? "text-black"
                                        : "text-gray-600"
                                        }`}
                                >
                                    {facing}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className='flex flex-row gap-4'>
                <ButtonCommon
                    onClick={() => {
                        removeAllFilters()
                        setOpenFilter(false)
                    }}
                    bgColor='#fff' border='border' textC='#000' title='Reset' />
                <ButtonCommon
                    onClick={() => {
                        handleSubmit()
                    }}
                    bgColor='bg-black' border='' textC='text-white' title='Apply Filters' />
            </div>

        </div>
    );
};

export default FilterComponent;