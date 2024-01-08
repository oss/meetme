// server.js
import React from "react";
import { lazy } from "react";
import Footer from "./components/footer";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useParams,
} from "react-router-dom";
import Navbar from "./components/navigation-bar";
const CreateMeeting = lazy(() => import("./pages/create-meeting"));
const ErrorPage = lazy(() => import("./pages/error-page"));
const DevDashboard = lazy(() => import("DASHBOARD_TO_REPLACE"));
const Dashboard = lazy(() => import("./pages/dashboard2"));
const MyOrgs = lazy(() => import("./pages/my-orgs"));
const CalendarLoader = lazy(() => import("./pages/calendar-loader"));
const CreateOrg = lazy(() => import("./pages/create-org"));
const Error404 = lazy(() => import("./pages/error-404"));
const MyMeetings = lazy(() => import("./pages/my-meetings"));
import "./index.css";
import Meeting from "./pages/meeting";
const Faq = lazy(() => import("./pages/faq"));
const OrgLoader = lazy(() => import("./components/org-loader"));
const MyInvitations = lazy(() => import("./pages/my-invitations"));
const Logout = lazy(() => import("./pages/logout"));

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Navbar />
          <Outlet />
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
                  <Meeting />
                </React.Suspense>
              ),
            },
            {
              path: ":id/legacy",
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
        <div className="grow">
          <RouterProvider router={router} />
        </div>
      </div>
    </>
  );
}

export default App;
