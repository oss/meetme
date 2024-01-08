import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

export default function HeadlessDialogue({
    children,
    isOpen,
    setIsOpen,
    closePopup,
    title,
}: {
    children?: React.ReactNode;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    closePopup?: () => void;
    title?: string;
}) {
    if (closePopup == undefined) {
        closePopup = () => {
            setIsOpen(false);
        };
    }

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closePopup}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md min-w-fit transform rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    ></Dialog.Title>
                                    <div className="w-full min-h-[20px] flex justify-between">
                                        <p className="text-lg font-medium leading-6 text-gray-900">
                                            {title}
                                        </p>
                                        <button
                                            className="w-fit h-fit hover:text-gray-400 transition-all duration-100 ease-linear"
                                            onClick={closePopup}
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
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    {children}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
