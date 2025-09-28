import React from 'react'

const ButtonCommon = ({ title, onClick }: { title: string, onClick: () => void }) => {
    return (
        <button onClick={onClick} className='cursor-pointer h-9 rounded-md bg-black px-4 font-medium flex justify-center text-white items-center w-full text-[16px] transition-all duration-300'>
            {title}
        </button>
    )
}

export default ButtonCommon
