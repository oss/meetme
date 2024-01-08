import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrgOwner from '../pages/organization/org-owner';
import OrgUser from '../pages/organization/org-user';
import Cookies from 'js-cookie';

function OrgLoader() {
    const { orgID } = useParams();
    const [calendars, setCalendars] = useState(null);
    const [orgData, setOrgData] = useState(null);
    const [owner, setOwner] = useState(null);
    const [members, setMembers] = useState(null);
    const [pendingMembers, setPendingMembers] = useState(null);

    useEffect(() => {
        fetch('https://api.localhost.edu/org/' + orgID, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                getCalendars(data.organization.calendars);

                setOrgData(data);
                setMembers(data.organization.members);
                setPendingMembers(data.organization.pendingMembers);

                const session_user = JSON.parse(atob(Cookies.get('session'))).passport
                    .user;
                if (data.organization.owner === session_user.uid) {
                    setOwner(true);
                } else {
                    setOwner(false);
                }
            });
    }, []);

    const getCalendars = (calendarIDs) => {
        if (calendarIDs.length == 0) {
            setCalendars([]);
        } else {
            let fetchCount = calendarIDs.length;
            let calendarInfo = new Array(calendarIDs.length);
            for (let i = 0; i < calendarIDs.length; i++) {
                fetch(process.env.API_URL + '/cal/' + calendarIDs[i]._id + '/meta', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        fetchCount--;
                        calendarInfo[i] = data.metadata;
                        if (fetchCount == 0) {
                            setCalendars(calendarInfo);
                        }
                    });
            }
        }
    };

    if (
        calendars == null ||
    members == null ||
    pendingMembers == null ||
    orgData == null
    ) {
        return <div>Loading</div>;
    }

    if (owner)
        return (
            <OrgOwner
                calendars={calendars}
                members={members}
                pendingMembers={pendingMembers}
                orgData={orgData}
                setCalendars={setCalendars}
                setPendingMembers={setPendingMembers}
            />
        );
    else
        return (
            <OrgUser
                calendars={calendars}
                members={members}
                pendingMembers={pendingMembers}
                orgData={orgData}
            />
        );
}

export default OrgLoader;
