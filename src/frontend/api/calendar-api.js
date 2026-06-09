export const CalendarAPI = {
    getMetadata: async (calendarID) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/meta`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => res.json());
        return data;
    },

    getAllMetadata: async (calendarIDs) => {
        let responses = await Promise.all(
            calendarIDs.map((calendarID) => {
                return fetch(`${process.env.API_URL}/cal/${calendarID}/meta`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            })
        );
        let data = await Promise.all(responses.map((res) => res.json()));
        return data;
    },

    getMainData: async (calendarID) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/main`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => res.json());
        return data;
    },

    getTimeBlocks: async (calendarID) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/timeblocks`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => res.json());
        return data;
    },

    getUserTimeline: async (calendarID) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/meetme/me`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
            }
        ).then((res) => res.json());
        return data;
    },

    getMemberList: async (calendarID) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/memberlist`,
            {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => res.json());
        return data;
    },

    createCalendar: async (body) => {
        let data = await fetch(`${process.env.API_URL}/cal`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }).then((res) => res.json());
        return data;
    },

    shareCalendar: async (calendarID, pendingUsers) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/share`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    new_users: pendingUsers,
                }),
            }
        ).then((res) => res.json());
        return data;
    },
    leaveCalendar: async (calendarID) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/leave`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }
        ).then((res) => res.json());
        return data;
    },

    deleteCalendar: async (calendarID) => {
        let data = await fetch(`${process.env.API_URL}/cal/${calendarID}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        }).then((res) => res.json());
        return data;
    },

    renameCalendar: async (calendarID, newName) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/name`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ new_name: newName }),
            }
        ).then((res) => res.json());

        return data;
    },

    acceptCalendarInvite: async (calendarID) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/accept`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => res.json());
        return data;
    },

    declineCalendarInvite: async (calendarID) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/decline`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => res.json());
        return data;
    },
    removeAccess: async (calendarID, netid) => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/share`,
            {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ target_users: [netid] }),
            }
        ).then((res) => res.json());
        return data;
    },
    setFinalMeetingTime: async (calendarID, startTime, endTime)=>{
        let data = await fetch(
            `${process.env.API_URL}/cal/${calendarID}/meet_time`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ start: startTime, end: endTime }),
            }
        ).then((res) => res.json());
        return data;
    }
};
