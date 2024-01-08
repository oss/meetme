import { useEffect, useRef, useState, createContext, useContext } from "react";
import { CalendarAPI } from "../api/calendar-api";
import { OrganizationAPI } from "../api/organization-api";
import { socket } from "../socket";
import Tabs from "../components/tabs";
import MeetingTile from "../components/dashboard/meeting-tile";
import uniqid from "uniqid";
import OrgTile from "../components/dashboard/org-tile";

const CalendarDataContext = createContext<{
    calendarData: int[];
    setCalendarData: (param: any) => void;
}>(null);
export function useCalendarDataContext() {
    return useContext(CalendarDataContext);
}

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState(null);
    const [allCalendarMetadata, setAllCalendarMetadata] = useState<any[]>(null);
    const [allOrgData, setAllOrgData] = useState(null);
    const [isTileLayout, setIsTileLayout] = useState(true);
    const stateRef = useRef<any>();
    stateRef.current = allCalendarMetadata;

    useEffect(() => {
        fetch(process.env.API_URL + "/user/me", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setUserInfo(data);
                getCalendarMetadata(data);
                getOrganizationData(data);
            });
    }, []);

    useEffect(() => {
        socket.emit("dashboard");

        const connectError = (err: any) => {};
        const recieveMsg = (msg: any, obj: any) => {};
        const updateCalendar = (cal_id: string) => {
            updateCalendarMetaData(cal_id);
        };
        const onOrgInvite = (org_id: string) => {};

        socket.on("connect_error", connectError);
        socket.on("custom-message", recieveMsg);
        socket.on("calendar_metadata_updated", updateCalendar);
        socket.on("org_invite", onOrgInvite);

        return () => {
            socket.offAny(connectError);
            socket.offAny(recieveMsg);
            socket.offAny(updateCalendar);
            socket.offAny(onOrgInvite);
        };
    }, []);

    async function getCalendarMetadata(data: any) {
        let calendarIDs = data.data.calendars.map((cal: any) => cal._id);
        let res = await CalendarAPI.getAllMetadata(calendarIDs);
        setAllCalendarMetadata(res.map((calendar) => calendar.metadata));
    }
    async function getOrganizationData(data: any) {
        let orgIDs = data.data.organizations.map((org: any) => org._id);
        let res = await OrganizationAPI.getAllData(orgIDs);
        setAllOrgData(res.map((org) => org.organization));
    }

    async function updateCalendarMetaData(calendarID: string) {
        let data = await CalendarAPI.getMetadata(calendarID);
        let currentMetaData = [...stateRef.current];

        for (let i = 0; i < currentMetaData.length; i++) {
            if (currentMetaData[i]._id === calendarID) {
                currentMetaData[i] = data.metadata;
                setAllCalendarMetadata(currentMetaData);
                break;
            }
        }
    }

    if (allCalendarMetadata == null || allOrgData == null) {
        return <div>Loading...</div>;
    }
    return (
        <div className="py-3 px-10 w-full h-full bg-gray-100 border border-gray-200">
            <Tabs
                categories={["Meetings", "Organizations"]}
                panels={[
                    <div className="w-full">
                        <div
                            className={`w-full ${
                                isTileLayout && "flex flex-wrap"
                            }`}
                        >
                            <CalendarDataContext.Provider
                                value={{
                                    calendarData: allCalendarMetadata,
                                    setCalendarData: setAllCalendarMetadata,
                                }}
                            >
                                {allCalendarMetadata.map((calendar) => {
                                    return (
                                        <MeetingTile
                                            isTileLayout={isTileLayout}
                                            key={uniqid()}
                                            metadata={calendar}
                                        />
                                    );
                                })}
                            </CalendarDataContext.Provider>
                            {allCalendarMetadata.length == 0 && (
                                <p className="w-full text-lg text-gray-600/60 font-semibold text-center">
                                    No meetings yet...
                                </p>
                            )}
                        </div>
                    </div>,
                    <div className="w-full flex flex-wrap">
                        <div
                            className={`w-full ${
                                isTileLayout && "flex flex-wrap"
                            }`}
                        >
                            {allOrgData.map((org: any) => {
                                return (
                                    <OrgTile
                                        isTileLayout={isTileLayout}
                                        orgData={org}
                                    />
                                );
                            })}
                            {allOrgData.length == 0 && (
                                <p className="w-full text-lg text-gray-600/60 font-semibold text-center">
                                    No organizations created...
                                </p>
                            )}
                        </div>
                    </div>,
                ]}
            />
        </div>
    );
}
