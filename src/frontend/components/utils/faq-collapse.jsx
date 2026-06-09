import React, { useState } from 'react';

const FaqCollapse = ({ question, answer }) => {
    const [open, setOpen] = useState(false);

    const toggle = () => {
        setOpen(!open);
    };

    return (
        <>
            <div className="mb-4 text-left w-4/5">
                <div
                    className="p-5 grid content-between grid-cols-2 cursor-pointer"
                    onClick={toggle}
                    style={{ backgroundColor: 'rgb(220, 220, 220)' }}
                >
                    <p className="font-bold">{question}</p>
                    <span
                        className={`${
                            open ? 'rotate-[-180]' : 'rotate-90'
                        } transition-all duration-300 place-self-end`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                        </svg>
                    </span>
                </div>
                <p
                    className={`${
                        open ? 'py-5 max-h-20' : 'max-h-0'
                    } px-5 transition-all duration-300 overflow-hidden delay-0 w-4/5`}
                >
                    {answer}
                </p>
            </div>
        </>
    );
};

export default FaqCollapse;
