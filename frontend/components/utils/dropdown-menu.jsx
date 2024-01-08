import '../../index.css';

import { useState } from 'react';
import uniqid from 'uniqid';

function DropdownMenu({
    cssString = '',
    menuItems = [],
    menuItemFunctions = [],
}) {
    let [open, setOpen] = useState(false);

    return (
        <div
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(!open);
            }}
            className={
                'relative transition-all duration-150 p-1 mx-1 hover:cursor-pointer hover:bg-gray-400/80 rounded w-fit h-fit ' +
                cssString
            }
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3 h-3"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
            </svg>
            <div
                className={`z-50 origin-top-left transition-all ease-linear duration-100 ${
                    open ? 'scale-100' : 'scale-0'
                } absolute h-fit whitespace-nowrap p-2 bg-white shadow rounded `}
            >
                {menuItems.map((item, index) => {
                    return (
                        <div
                            key={uniqid()}
                            onClick={menuItemFunctions[index]}
                            className="transition-all duration-100 ease-linear hover:bg-gray-200 p-1 rounded"
                        >
                            {item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
export default DropdownMenu;
