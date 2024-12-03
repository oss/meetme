import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, MenuButton, MenuItems, MenuItem, Transition, Button } from '@headlessui/react';
import userStore from '@store/userStore';
import { useShallow } from 'zustand/react/shallow';

function NotificationIcon() {
    const notificationNumber = userStore(useShallow((store) => store.pendingCalendars.length + store.pendingOrganizations.length));
    return (
        <p className={`${notificationNumber === 0 && 'hidden'} absolute -right-1 -top-1 flex items-center justify-center w-4 h-4 text-sm text-white rounded-full bg-rutgers_red`} to='/invites'>
            {notificationNumber}
        </p>
    )
}

function Navbar() {
    return (
        <div className="flex w-full bg-white border-white h-14" >
            <div className="flex items-center p-2 grow-0">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div className="flex items-center">
                        <span className="text-xl font-semibold">
                            MeetMe
                        </span>
                    </div>
                </Link>
            </div>
            <div className='flex items-center ml-auto p-2 gap-x-4'>
                <div className='relative bg-white hover:bg-slate-100'>
                    <Link to='/invites'>
                        <NotificationIcon />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-7 h-7"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5"
                            />
                        </svg>
                    </Link>
                </div>
                <Menu>
                    <MenuButton className='bg-rutgers_red hover:bg-red-600 rounded p-1'>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="white"
                            className="w-6 h-6 inline"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                            />
                        </svg>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="3"
                            stroke="white"
                            className="w-3 h-3 inline"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                        </svg>
                    </MenuButton>
                    <Transition
                        enter="transition ease-out duration-75"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <MenuItems className='bg-white rounded-lg outline outline-slate-50' anchor="bottom end">
                            <MenuItem>
                                <Link className="data-[active]:bg-rutgers_red data-[active]:text-white 
                                 text-gray-900 
                                flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none" to="/cal/create">
                                    New Meeting
                                </Link>
                            </MenuItem>
                            <MenuItem>
                                <Link className="data-[active]:bg-rutgers_red data-[active]:text-white 
                                 text-gray-900 
                                flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none" to="/org/create">
                                    New Organization
                                </Link>
                            </MenuItem>
                        </MenuItems>
                    </Transition>
                </Menu>
                <Menu>
                    <MenuButton>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                    </MenuButton>
                    <Transition
                        enter="transition ease-out duration-75"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <MenuItems className='bg-white rounded-lg outline outline-slate-50' anchor="bottom end">
                            <MenuItem>
                                <Link className="data-[active]:bg-rutgers_red data-[active]:text-white 
                                 text-gray-900 
                                flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none" to="/faq">
                                    FAQ
                                </Link>
                            </MenuItem>
                            <MenuItem>
                                <Link className="data-[active]:bg-rutgers_red data-[active]:text-white 
                                 text-gray-900 
                                flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none" to="/logout">
                                    Logout
                                </Link>
                            </MenuItem>
                        </MenuItems>
                    </Transition>
                </Menu>
            </div>
        </div>
    );
}

export default Navbar;
