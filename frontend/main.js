// server.js
import React from "react";
import { lazy } from "react";
import { createBrowserRouter, RouterProvider, Outlet, useParams } from "react-router-dom";
import Navbar from "./components/navigation-bar";
const CreateMeeting = lazy(() => import("./pages/create-meeting"));
const ErrorPage = lazy(() => import("./pages/error-page"));
const DevDashboard = lazy(() => import("DASHBOARD_TO_REPLACE"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const MyOrgs = lazy(() => import("./pages/my-orgs"));
const CalendarLoader = lazy(() => import("./pages/calendar"));
const CreateOrg = lazy(() => import("./pages/create-org"));
const Error404 = lazy(() => import("./pages/error-404"));
const MyMeetings = lazy(() => import("./pages/my-meetings"));
import "./index.css";
const Faq = lazy(() => import("./pages/faq"));
const OrgLoader = lazy(() => import("./components/org-loader"));
const MyInvitations = lazy(() => import("./pages/my-invitations"));
const Logout = lazy(() => import("./pages/logout"));
import { useShallow } from 'zustand/react/shallow';
import dialogueStore from './store/dialogueStore';
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

import userStore from "./store/userStore";

function App() {
    const notificationNumber = userStore(useShallow((store) => store.pendingCalendars.length + store.pendingOrganizations.length));
    const dialogueStatus = dialogueStore((store) => store)

    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <>
                    <div className="relative">
                        <Navbar numInvites={notificationNumber} />
                    </div>
                    <div className="relative grow">
                        <Outlet />
                    </div>
                    <div className="absolute h-full w-full pointer-events-none">
                        <div className="relative">
                            <Transition appear show={dialogueStatus.display} as={Fragment}>
                                <Dialog onClose={dialogueStatus.closePanel}>
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="fixed inset-0 bg-black/25" />
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
                                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                                    {dialogueStatus.panel}
                                                </Dialog.Panel>
                                            </Transition.Child>
                                        </div>
                                    </div>
                                </Dialog>
                            </Transition>
                        </div>
                    </div>
                </>
            ),
            errorElement: <ErrorPage />,
            children: [
                {
                    path: "",
                    element: (
                        <React.Suspense fallback={"Loading..."}>
                            <Dashboard />
                        </React.Suspense>
                    ),
                },
                {
                    path: "cal",
                    element: <Outlet />,
                    children: [
                        // {
                        //     path: '',
                        //     element: <MyMeetings />
                        // },
                        {
                            path: "create",
                            element: (
                                <React.Suspense fallback={"Loading..."}>
                                    <CreateMeeting />
                                </React.Suspense>
                            ),
                        },
                        {
                            path: ":id",
                            element: (
                                <React.Suspense fallback={"Loading..."}>
                                    <CalendarLoader />
                                </React.Suspense>
                            ),
                        },
                    ],
                },
                {
                    path: "org",
                    element: <Outlet />,
                    children: [
                        // {
                        //     path: '',
                        //     element: <MyOrgs />
                        // },
                        {
                            path: "create",
                            element: (
                                <React.Suspense fallback={"Loading..."}>
                                    <CreateOrg />
                                </React.Suspense>
                            ),
                        },
                        {
                            path: ":orgID",
                            element: (
                                <React.Suspense fallback={"Loading..."}>
                                    <Outlet />
                                </React.Suspense>
                            ),
                            children: [
                                {
                                    path: "",
                                    element: (
                                        <React.Suspense fallback={"Loading..."}>
                                            <OrgLoader />
                                        </React.Suspense>
                                    ),
                                },
                                {
                                    path: "add_meeting",
                                    element: (
                                        <React.Suspense fallback={"Loading..."}>
                                            <CreateMeeting isOrganizationOwned={true} />
                                        </React.Suspense>
                                    ),
                                },
                            ],
                        },
                    ],
                },
                {
                    path: "invites",
                    element: <Outlet />,
                    children: [
                        {
                            path: "",
                            element: (
                                <React.Suspense fallback={"Loading..."}>
                                    <MyInvitations />
                                </React.Suspense>
                            ),
                        },
                    ],
                },
                {
                    path: "devpage",
                    element: (
                        <React.Suspense fallback={"Loading..."}>
                            <DevDashboard />
                        </React.Suspense>
                    ),
                },
                {
                    path: "faq",
                    element: (
                        <React.Suspense fallback={"Loading..."}>
                            <Faq />
                        </React.Suspense>
                    ),
                },
                {
                    path: "logout",
                    element: (
                        <React.Suspense fallback={"Loading..."}>
                            <Logout />
                        </React.Suspense>
                    ),
                },
                {
                    path: "*",
                    element: (
                        <React.Suspense fallback={"Loading..."}>
                            <Error404 />
                        </React.Suspense>
                    ),
                },
            ],
        },
    ]);

    return (
        <>
            <div className="flex flex-col w-full h-full">
                <RouterProvider router={router} />
            </div>
        </>
    );
}

export default App;
