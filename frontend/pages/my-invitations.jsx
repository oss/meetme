import { useState, useEffect, useRef } from "react";
import uniqid from "uniqid";
import { Link } from "react-router-dom";
import Tile from "../components/utils/tile";
import { CalendarAPI } from "../api/calendar-api";
import { OrganizationAPI } from "../api/organization-api";
import Tabs from "../components/tabs";
import InvitationTile from "../components/my-invitations/invitation-tile";

import userStore from '@store/userStore';
import metadataStore from '@store/calendarMetadata';

function MyInvitations() {
    const [pendingCalendars, setPendingCalendars] = useState(null);
    const [pendingOrganizations, setPendingOrganizations] = useState(null);

    const userHook = userStore((store) => store.getUserData);

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
                getPendingCalendarData(data);
                getPendingOrganizationData(data);
            });
    }, []);

    async function getPendingCalendarData(data) {
        let calendarData = await CalendarAPI.getAllMetadata(
            data.data.pendingCalendars.map((calendar) => calendar._id)
        );
        console.log("CALDATA");
        console.log(calendarData);
        setPendingCalendars(calendarData.map((calendar) => calendar.metadata));
    }
    async function getPendingOrganizationData(data) {
        let organizationData = await OrganizationAPI.getAllData(
            data.data.pendingOrganizations.map((org) => org._id)
        );
        setPendingOrganizations(
            organizationData.map((org) => org.organization)
        );
    }
    async function acceptOrgInvite(organizationID) {
        let data = await OrganizationAPI.acceptOrgInvite(organizationID);
        if (data.Status === "ok") {
            setPendingOrganizations(
                [...pendingOrganizations].filter(
                    (org) => org._id !== organizationID
                )
            );
        }
        userHook();
        console.log(JSON.stringify(data));
    }
    async function declineOrgInvite(organizationID) {
        let data = await OrganizationAPI.declineOrgInvite(organizationID);
        if (data.Status === "ok") {
            setPendingOrganizations(
                [...pendingOrganizations].filter(
                    (org) => org._id !== organizationID
                )
            );
        }
        console.log(JSON.stringify(data));
    }

    async function acceptCalendarInvite(calendarID) {
        let data = await CalendarAPI.acceptCalendarInvite(calendarID);
        if (data.Status === "ok") {
            setPendingCalendars(
                [...pendingCalendars].filter((cal) => cal._id !== calendarID)
            );
        }
        userHook();
        console.log(JSON.stringify(data));
    }

    async function declineCalendarInvite(calendarID) {
        let data = await CalendarAPI.declineCalendarInvite(calendarID);
        if (data.Status === "ok") {
            setPendingCalendars(
                [...pendingCalendars].filter((cal) => cal._id !== calendarID)
            );
        }
        console.log(JSON.stringify(data));
    }

    if (pendingCalendars === null || pendingOrganizations === null) {
        return (
            <div>
                <p>Loading data... please wait</p>
            </div>
        );
    }

    return (
        <div className="py-3 px-10 w-full h-full bg-gray-100 border border-gray-200">
            <Tabs
                categories={["Meetings", "Organizations"]}
                panels={[
                    <div className="w-full flex flex-wrap">
                        {pendingCalendars.map((cal) => {
                            return (
                                <InvitationTile
                                    id={cal._id}
                                    name={cal.name}
                                    owner={cal.owner._id}
                                    acceptInvite={() => {
                                        acceptCalendarInvite(cal._id);
                                    }}
                                    declineInvite={() => {
                                        declineCalendarInvite(cal._id);
                                    }}
                                />
                            );
                        })}
                        {pendingCalendars.length == 0 && (
                            <p className="w-full text-lg text-gray-600/60 font-semibold text-center">
                                No invitations...
                            </p>
                        )}
                    </div>,
                    <div className="w-full flex flex-wrap">
                        {pendingOrganizations.map((org) => {
                            return (
                                <InvitationTile
                                    id={org._id}
                                    name={org.name}
                                    owner={org.owner}
                                    acceptInvite={() => {
                                        acceptOrgInvite(org._id);
                                    }}
                                    declineInvite={() => {
                                        declineOrgInvite(org._id);
                                    }}
                                />
                            );
                        })}
                        {pendingOrganizations.length == 0 && (
                            <p className="w-full text-lg text-gray-600/60 font-semibold text-center">
                                No invitations...
                            </p>
                        )}
                    </div>,
                ]}
            />
        </div>
    );
}

export default MyInvitations;
