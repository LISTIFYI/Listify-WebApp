import React from 'react'

const ButtonCommon = ({ title, onClick, border, bgColor, textC }: { title: string, onClick?: () => void, border?: string, bgColor?: string, textC?: string }) => {
    return (
        <button onClick={onClick} className={` cursor-pointer h-10 rounded-md ${bgColor} ${border} border-[#454545] px-4 font-medium flex justify-center ${textC} items-center w-full text-[16px] transition-all duration-300`}>
            {title}
        </button>
    )
}

export default ButtonCommon
