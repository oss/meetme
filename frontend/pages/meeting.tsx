import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tile from "../components/utils/tile";
import MeetingCalendar from "../components/meeting/meeting-calendar";
import MeetingCollaboratorRow from "../components/meeting/meeting-collaborator-row";
import { TimeBlock } from "../components/meeting/meeting-grid";
import InvitePopup from "../components/meeting/popups/invite-popup";
import { OrganizationAPI } from "../api/organization-api";
import { socket } from "../socket";
import FinalMeetingPopup from "../components/meeting/popups/final-meeting-popup";
interface IMeeting {
    editMode?: boolean;
}

function Meeting(props: IMeeting) {
    const defaultProps = {
        editMode: true,
    };

    let [showInvitePopup, setShowInvitePopup] = useState(false);
    let [showFinalMeetingPopup, setShowFinalMeetingPopup] = useState(false);
    let [selectedUsers, setSelectedUsers] = useState([]);

    props = { ...props, ...defaultProps };

    const { id } = useParams();

    const [editMode, setEditMode] = useState(props.editMode);

    /*
     * The following is temporary code that will replaced later by the /api directory.
     */

    const [metaData, setMetaData] = useState(null);
    const getMetaData = async () => {
        const response = await fetch(`${process.env.API_URL}/cal/${id}/meta`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Data coud not be fetched!");
        } else {
            return response.json();
        }
    };

    const [collaborators, setCollaborators] = useState<any[]>(null);
    const loadMemberlist = async () => {
        let res = await getMetaData();
        setMetaData(res);
        console.log({ md: res });
        
        let meetingCollaborators = (await getCollaborators()).memberlist.map((member: any) => member._id);
        if (res.metadata.owner.owner_type == "organization") {
            let orgData = await OrganizationAPI.getData(
                res.metadata.owner._id
            );
            let orgCollaborators = orgData.organization.members.map(
                (member: any) => member._id
            );
            orgCollaborators.push(orgData.organization.owner);
            setCollaborators([...orgCollaborators, ...meetingCollaborators]);
        }else{
            setCollaborators([...meetingCollaborators]);
        }
    }

    

    const [globalTimeline, setGlobalTimeline] = useState<any[]>(null);
    const loadGlobalTimeline = async () => {
        const response = await fetch(
            `${process.env.API_URL}/cal/${id}/meetme`,
            {
                credentials: "include",
                body: JSON.stringify({
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            }
        );
        if (!response.ok) {
            throw new Error("Data coud not be fetched!");
        }
        let res = await response.json();
        setGlobalTimeline(res);
        return res;
    }

    useEffect(() => {
        loadMemberlist();
        loadGlobalTimeline();
        return setupSockets();
    }, []);

    const [mainData, setMainData] = useState(null);
    const [finalMeeting, setFinalMeeting] = useState<any>(null);
    const getMainData = async () => {
        const response = await fetch(`${process.env.API_URL}/cal/${id}/main`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Data coud not be fetched!");
        } else {
            return response.json();
        }
    };
    useEffect(() => {
        getMainData()
            .then((res) => {
                setMainData(res);
                setFinalMeeting(res.maindata.meetingTime);
            })
            .catch((e) => {
                console.log(e.message);
            });
    }, []);

    const [timeBlocks, setTimeBlocks] = useState(null);
    const getTimeBlocks = async () => {
        const response = await fetch(
            `${process.env.API_URL}/cal/${id}/timeblocks`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            throw new Error("Data coud not be fetched!");
        } else {
            return response.json();
        }
    };
    useEffect(() => {
        getTimeBlocks()
            .then((res) => {
                setTimeBlocks(res);
            })
            .catch((e) => {
                console.log(e.message);
            });
    }, []);

    const getCollaborators = async () => {
        const response = await fetch(
            `${process.env.API_URL}/cal/${id}/memberlist`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            throw new Error("Data coud not be fetched!");
        } else {
            return response.json();
        }
    };

    function setupSockets() {
        function handleCalendarUpdates(operation:string, target:string) {
            console.log('socket');
            console.log(JSON.stringify(operation));
            console.log(JSON.stringify(target));
            switch (target) {
            case 'meetme':
                // console.log('got meetme update');
                loadGlobalTimeline();
                break;
            case 'timeline':
                console.log('got timeline update');
                break;
            case 'memberlist':
                console.log('got memberlist update');
                loadMemberlist();
                break;
            }
        }
        socket.on(id, handleCalendarUpdates);

        //console.log('connecting');
        socket.emit('join cal', id);

        return () => {
            socket.off(id, handleCalendarUpdates);
        };
    }

    const title: string =
        metaData != null ? metaData.metadata.name : "Loading...";

    const startHour: number =
        timeBlocks != null
            ? new Date(timeBlocks.timeblocks[0].start).getTime()
            : 0;

    const endHour: number =
        timeBlocks != null
            ? new Date(timeBlocks.timeblocks[0].end).getTime()
            : 0;

    /*
     * End of temporary code
     */

    function changeEditMode(e: React.MouseEvent<HTMLButtonElement>) {
        setEditMode(!editMode);
    }

    function getReadbleFinalMeetingString(){
        // shows the final meeting in a readable format with AM and PM
        if (finalMeeting == null) {
            return "No final meeting time set";
        }
        let start = new Date(finalMeeting.start);
        let end = new Date(finalMeeting.end);
        let startString = start.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
        let endString = end.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
        return `${startString} - ${endString}`;

    }

    if (metaData == null || timeBlocks == null || collaborators == null || globalTimeline == null || mainData == null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full h-full bg-gray-100 flex pt-10">
            <InvitePopup
                isOpen={showInvitePopup}
                setIsOpen={setShowInvitePopup}
                members={collaborators}
                setMembers={setCollaborators}
                calendarID={id}
                loadGlobalTimeline={loadGlobalTimeline}
            />
            <FinalMeetingPopup
                isOpen={showFinalMeetingPopup}
                setIsOpen={setShowFinalMeetingPopup}
                setFinalMeeting={setFinalMeeting}
                calendarID={id}
            />
            <div className="w-[40%] flex flex-col items-center">
                <div className="w-2/3">
                    <div className="m-2 py-5 px-8 rounded shadow-sm bg-white">
                        <div className="w-full flex justify-between items-center">
                            <p className="text-gray-600 font-bold">
                                Meeting Collaborators
                            </p>
                            <button
                                className= "px-1 ml-1 transition-all ease-linear rounded text-gray-600 hover:text-gray-400"
                                onClick={() => {
                                    setShowInvitePopup(true);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                        </div>
                        {collaborators.map((member: any, i: number) => {
                            return <MeetingCollaboratorRow name={member} />;
                        })}
                    </div>
                </div>
                <div className="w-2/3">
                    <div className="m-2 py-5 px-8 rounded shadow-sm bg-white">
                        <div className="w-full flex justify-between items-center">
                            <p className="text-gray-600 font-bold">
                                Final Meeting
                            </p>
                            <button
                                className= "px-1 ml-1 transition-all ease-linear rounded text-gray-600 hover:text-gray-400"
                                onClick={() => {
                                    setShowFinalMeetingPopup(true);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                        </div>
                    {finalMeeting.start == null ?
                        <p className="text-slate-400">
                            Not set yet.
                        </p>
                        :
                        <>
                            <p className="text-slate-600">{new Date(finalMeeting.start).toLocaleDateString()}</p>
                            <p className="text-slate-600">{getReadbleFinalMeetingString()}</p>
                        </>
                    }
                    </div>
                </div>
                <div className="w-2/3">
                    <Tile title={"Available (hover over meeting)"}>
                        <div>
                            {collaborators.map((member: any, i: number) => {
                                if (selectedUsers.includes(member)) {
                                    return (
                                        <p className="text-black font-semibold bg-red-200">
                                            {member}
                                        </p>
                                    );
                                }
                                return (
                                    <p className="text-gray-400">{member}</p>
                                );
                            })}
                        </div>
                    </Tile>
                </div>
            </div>
            <div className="w-[50%] flex flex-col items-center">
                <MeetingCalendar
                    meetingId={id}
                    readonly={editMode}
                    title={title}
                    startHour={startHour}
                    endHour={endHour}
                    collaborators={collaborators}
                    potentialMeetings={timeBlocks.timeblocks.map(
                        (object: any, i: number) => {
                            let date = new Date(object.start);
                            return date;
                        }
                    )}
                    onButtonPress={changeEditMode}
                    buttonTitle={
                        editMode ? "Edit your times" : "View everyone's times"
                    }
                    setSelectedUsers={setSelectedUsers}
                    globalTimeline={globalTimeline}
                />
            </div>
        </div>
    );
}

export default Meeting;
