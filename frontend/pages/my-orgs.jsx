import { useState, useEffect, useRef } from 'react';
import Tile from '../components/utils/tile';
import uniqid from 'uniqid';
import { useNavigate } from 'react-router-dom';

export default function MyOrgs() {
    let [organizations, setOrganizations] = useState(null);
    let [calendars, setCalendars] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
    // get myorgdata here
        fetch(process.env.API_URL + '/user/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                let orgIDs = data.data.organizations;
                // console.log(orgIDs);
                if (orgIDs.length == 0) {
                    setCalendars([]);
                    setOrganizations([]);
                } else {
                    setCalendars([]);
                    let orgInfo = new Array(orgIDs.length);
                    let fetchCount = orgInfo.length;

                    for (let orgIdx = 0; orgIdx < orgInfo.length; orgIdx++) {
                        fetch(process.env.API_URL + '/org/' + orgIDs[orgIdx]._id, {
                            method: 'GET',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                fetchCount--;
                                orgInfo[orgIdx] = data.organization;
                                if (fetchCount == 0) {
                                    setOrganizations(orgInfo);
                                    // get all the corresponding calendars info
                                    let calendarsToDisplay = [];
                                    for (let oi = 0; oi < orgInfo.length; oi++) {
                                        for (let ci = 0; ci < orgInfo[oi].calendars.length; ci++) {
                                            //    console.log(process.env.API_URL + "/cal/"+ orgInfo[oi].calendars[ci]._id);
                                            fetch(
                                                process.env.API_URL +
                          '/cal/' +
                          orgInfo[oi].calendars[ci]._id +
                          '/meta',
                                                {
                                                    method: 'GET',
                                                    credentials: 'include',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                }
                                            )
                                                .then((res) => res.json())
                                                .then((data) => {
                                                    calendarsToDisplay.push({
                                                        id: orgInfo[oi]._id,
                                                        calendarInfo: data,
                                                    });
                                                    setCalendars([...calendarsToDisplay]);
                                                    // console.log(calendarsToDisplay);
                                                });
                                        }
                                    }
                                }
                            });
                    }
                }
            });
    }, []);

    if (organizations == null || calendars == null) {
        return <>Loading data...</>;
    }
    return (
        <div className="bg-neutral-100 flex flex-col items-center px-10">
            <div className="container mt-4 mb-4 flex justify-center">
                <p className="text-3xl font-bold">My Organizations</p>
            </div>
            <div className="container p-3 w-10/12 grid gap-6 grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => {
                    return (
                        <div key={uniqid()} className="w-full h-full">
                            <Tile fullHeight={true}>
                                <div className="h-5/6 flex flex-col">
                                    <p
                                        className="cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 
                                        hover:bg-rose-700 duration-300 text-lg text-white break-words rounded text-center bg-rose-600"
                                        onClick={() => {
                                            navigate('/org/' + org._id);
                                        }}
                                    >
                                        {org.name}
                                    </p>
                                    {/* <p className='text-lg text-white break-words rounded text-center bg-rose-600'>{org._id}</p> */}
                                    <p className="text-base font-bold text-gray-700/50 mt-3">
                    Members
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {org.members.slice(0, 2).map((member) => {
                                            return (
                                                <p className="mt-1 py-1 overflow-x-hidden">
                                                    {member._id}
                                                </p>
                                            );
                                        })}
                                        {org.members.length >= 3 ? (
                                            <p className="mt-1 px-2 py-1">...</p>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                    {org.members.length == 0 ? (
                                        <p className="mt-1 px-2 py-1 text-center text-gray-400">
                      No members added yet
                                        </p>
                                    ) : (
                                        ''
                                    )}
                                    <p className="text-base font-bold text-gray-700/50 mt-3">
                    Meetings
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {calendars
                                            .filter((calendar) => {
                                                return calendar.id == org._id;
                                            })
                                            .slice(0, 2)
                                            .map((cal) => {
                                                return (
                                                    <a
                                                        onClick={() => {
                                                            navigate(`/cal/${cal.calendarInfo.metadata._id}`);
                                                        }}
                                                        className="transition ease-in-out delay-70 hover:scale-105 duration-100 mt-1 py-1 overflow-x-hidden cursor-pointer"
                                                        key={uniqid()}
                                                    >
                                                        {cal.calendarInfo.metadata.name}
                                                    </a>
                                                );
                                            })}
                                        {calendars.filter((calendar) => {
                                            return calendar.id == org._id;
                                        }).length > 2 ? (
                                                <p className="mt-1 px-2 py-1">...</p>
                                            ) : (
                                                ''
                                            )}
                                    </div>
                                    {calendars.filter((calendar) => {
                                        return calendar.id == org._id;
                                    }).length == 0 ? (
                                            <p className="mt-1 px-2 py-1 text-center text-gray-400">
                      No Meetings Added Yet
                                            </p>
                                        ) : (
                                            ''
                                        )}
                                </div>
                            </Tile>
                        </div>
                    );
                })}
            </div>
            <div>
                {organizations.length == 0 ? (
                    <p className="w-full text-center text-2xl text-gray-700/50 mb-7">
            No Organizations Created Yet
                    </p>
                ) : (
                    ''
                )}
            </div>
        </div>
    );
}

/*

*/
