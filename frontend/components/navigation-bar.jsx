import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavDropdown from './utils/nav-dropdown';
import { socket } from '../socket';

function renderNotificationIcon(numInvites) {
    return numInvites != null && numInvites != 0 ? (
        <div className="flex items-center justify-center w-4 h-4 text-sm text-white rounded-full bg-rose-500">
            {numInvites}
        </div>
    ) : (
        ''
    );
}

function Navbar() {
    const [showInvites, setShowInvites] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showHamburger, setShowHamburger] = useState(false);
    const [numInvites, setNumInvites] = useState(null);

    useEffect(() => {
        fetch(process.env.API_URL + '/user/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setNumInvites(
                    data.data.pendingOrganizations.length +
                    data.data.pendingCalendars.length
                );
            });

        socket.on('pending_invitation_update', () => {
            fetch(process.env.API_URL + '/user/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    setNumInvites(
                        data.data.pendingOrganizations.length +
                        data.data.pendingCalendars.length
                    );
                });
        });
        return () => {
            socket.offAny('pending_invitation_update');
        };
    }, []);

    return (
        <div
            className="flex w-full bg-white border-white h-14"
            id="navbar_wrapper"
        >
            <div className="flex items-center ml-10">
                <div className="flex items-center">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <div className="flex items-center">
                            <span className="text-xl font-semibold">
                                MeetMe
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="flex flex-row justify-end w-1/2 h-full ml-auto mr-2">
                <div className="flex items-center space-x-4">
                    <NavDropdown
                        cssString="bg-gradient-to-r from-red-500 to-red-700 rounded"
                        onMouseDown={() => {
                            setShowCreate(true);
                        }}
                        onMouseLeave={() => {
                            setShowCreate(false);
                        }}
                        onUserSelect={() => {
                            setShowCreate(false);
                        }}
                        showMenu={showCreate}
                        image={[
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>,
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="3"
                                stroke="currentColor"
                                className="w-3 h-3 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                />
                            </svg>,
                        ]}
                        items={[
                            { url: '/cal/create', text: 'New Meeting' },
                            { url: '/org/create', text: 'New Organization' },
                        ]}
                    />
                    <div className="relative">
                        <NavDropdown
                            onMouseDown={() => {
                                setShowInvites(true);
                            }}
                            onMouseLeave={() => {
                                setShowInvites(false);
                            }}
                            onUserSelect={() => {
                                setShowInvites(false);
                            }}
                            showMenu={showInvites}
                            image={[
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
                                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5"
                                    />
                                </svg>,
                            ]}
                            items={[{ url: '/invites', text: 'Invites' }]}
                        />
                        <div className="absolute top-0 right-0">
                            {renderNotificationIcon(numInvites)}
                        </div>
                    </div>
                    <NavDropdown
                        onMouseDown={() => {
                            setShowHamburger(true);
                        }}
                        onMouseLeave={() => {
                            setShowHamburger(false);
                        }}
                        onUserSelect={() => {
                            setShowHamburger(false);
                        }}
                        showMenu={showHamburger}
                        image={[
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
                            </svg>,
                        ]}
                        items={[
                            // {url: '/cal', text: 'Meetings'},
                            // {url: '/org', text: 'Organizations'},
                            { url: '/faq', text: 'FAQs' },
                            { url: '/logout', text: 'Logout' },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}

export default Navbar;
