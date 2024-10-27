import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import orgData from "@store/orgData";
import dialogueStore from "@store/dialogueStore";
import Tile from "@primitives/tile";

function OrgOwner() {
    const { orgID } = useParams();
    const [userID, setUserID] = useState("");
    const setPanel = dialogueStore((store) => store.setPanel);

    const orgName = orgData((store) => store.orgData[orgID].data.name);
    const members = orgData((store) => store.orgData[orgID].data.members);

    let inviteNetID = async () => {
        if (userID === "") {
            alert("please enter a valid netid");
            return;
        }
        const resp = await fetch(process.env.API_URL + "/user/" + userID, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const resp_json = await resp.json();
        if (resp_json.Status !== "ok") {
            alert("netid is invalid or inactive");
            return;
        }
        for (let i = 0; i < members.length; i++) {
            if (members[i]._id === userID) {
                alert("user is already a member");
                return;
            }
        }
        for (let i = 0; i < pendingMembers.length; i++) {
            if (pendingMembers[i]._id === userID) {
                alert("user is already invited");
                return;
            }
        }
        fetch(
            process.env.API_URL + "/org/" + orgData.organization._id + "/share",
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    new_users: [userID],
                }),
            },
        )
            .then((res) => res.json())
            .then((data) => {
                setPendingMembers([...pendingMembers, { _id: userID }]);
                console.log(JSON.stringify(data));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    function deleteCalendar(cal_id) {
        console.log(cal_id);
        fetch(process.env.API_URL + "/cal/" + cal_id, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data.Status === "ok") {
                    setCalendars(calendars.filter((cal) => cal._id != cal_id));
                }
            });
    }

    function renameCalendar(cal_id, new_name) {
        fetch(process.env.API_URL + "/cal/" + cal_id + "/name", {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ new_name: new_name }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data.Status === "ok") {
                    setCalendars(
                        calendars.map((cal) => {
                            if (cal._id == cal_id) {
                                cal.name = new_name;
                            }
                            return cal;
                        }),
                    );
                }
            });
    }

    return (
        <div className="h-full bg-neutral-100 justify-center">
            <div className="w-10/12">
                <div className="flex flex-col items-center my-4">
                    <p className="mx-2 text-3xl bg-white rounded font-semibold px-3 py-2 shadow-sm mb-3">
                        {orgName}
                    </p>
                    <button
                        onClick={() => {
                            setPanel(<DeleteOrgPopup orgID={orgID} />);
                        }}
                        className="bg-rutgers_red rounded px-3 py-2 text-white transition-all
                                                    duration-100 ease-in-out hover:bg-red-600"
                    >
                        Delete Organization
                    </button>
                </div>
            </div>
            <div className="w-full md:grid md:grid-cols-2 md:gap-5">
                <div className="w-full h-full">
                    <Tile>
                        <div className="bg-white">
                            <Tile.Body>
                                <Tile.Title>Members</Tile.Title>
                                <div className="flex h-fit justify">
                                    <input
                                        className="shadow appearance-none border rounded w-full h-9 py-1 px-3 text-gray-700
                                                leading-tight focus:outline-none focus:shadow-outline"
                                        type="textfield"
                                        placeholder="NetID"
                                    />
                                    <button className="bg-rutgers_red rounded px-5 h-9 text-white transition-all duration-100 ease-in-out hover:bg-red-600">
                                        Invite
                                    </button>
                                </div>
                                <div className="py-2 flex flex-wrap">
                                    {members.map((member) => {
                                        return (
                                            <p
                                                key={member._id}
                                                className="my-1 mr-8 p-3 shadow rounded"
                                            >
                                                {member._id}
                                            </p>
                                        );
                                    })}
                                    <p className="text-sm text-gray-700/70">
                                        {members.length == 0 && "No members added yet" }
                                    </p>
                                </div>
                            </Tile.Body>
                        </div>
                    </Tile>
                </div>
            </div>
        </div>
    );
}
/*
<div className="flex h-fit justify">
    <input
        onChange={(e) => {
            setUserID(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
            if (e.key === "Enter") {
                inviteNetID();
            }
        }}
        className="shadow appearance-none border rounded w-full h-9 py-1 px-3 text-gray-700
                leading-tight focus:outline-none focus:shadow-outline"
        type="textfield"
        placeholder="NetID"
    />
    <button
        className="bg-rutgers_red rounded px-5 h-9 text-white transition-all
                    duration-100 ease-in-out hover:bg-red-600"
        onClick={inviteNetID}
    >
        Invite
    </button>
</div>
<div className="py-2 flex flex-wrap">
    {members.map((member) => {
        return (
            <p
                key={member._id}
                className="my-1 mr-8 p-3 shadow rounded"
            >
                {member._id}
            </p>
        );
    })}
    <p className="text-sm text-gray-700/70">
        {members.length == 0
            ? "No members added yet"
            : ""}
    </p>
</div>
</Tile>

*/

/*
<div className="w-full md:grid md:grid-cols-2 md:gap-5">
    <div className="w-full h-full">
        <Tile title="Calendars" fullHeight={true}>
            <div className="flex">
                <button
                    className="bg-rutgers_red rounded px-5 h-9 text-white transition-all
                                duration-100 ease-in-out hover:bg-red-600"
                    onClick={() => {
                        navigate(
                            `/org/${orgData.organization._id}/add_meeting`
                        );
                    }}
                >
                    Add
                </button>
            </div>
            <div className="py-2 flex flex-wrap">
                {calendars.map((calendar) => {
                    return (
                        <div
                            key={calendar._id + "1"}
                            className="cursor-pointer my-1 mr-8 p-3 flex items-center shadow rounded"
                            onClick={() => {
                                navigate(
                                    "/cal/" + calendar._id
                                );
                            }}
                        >
                            <p>{calendar.name}</p>
                            <DropdownMenu
                                menuItems={["Delete", "Rename"]}
                                menuItemFunctions={[
                                    () => {
                                        deleteCalendar(
                                            calendar._id
                                        );
                                    },
                                    () => {
                                        setShowRenameDialogue(
                                            true
                                        );
                                    },
                                ]}
                            />
                            <HeadlessDialogue
                                isOpen={showRenameDialogue}
                                setIsOpen={
                                    setShowRenameDialogue
                                }
                            >
                                <TextField
                                    enter_shortcut={() => {
                                        renameCalendar(
                                            calendar._id,
                                            "changed name"
                                        );
                                        setShowRenameDialogue(
                                            false
                                        );
                                    }}
                                />
                                <Button
                                    text="Change name"
                                    red
                                    click_passthrough={() => {
                                        renameCalendar(
                                            calendar._id,
                                            "changed name"
                                        );
                                        setShowRenameDialogue(
                                            false
                                        );
                                    }}
                                />
                            </HeadlessDialogue>
                        </div>
                    );
                })}
                <p className="text-sm text-gray-700/70">
                    {calendars.length == 0
                        ? "No calendars added yet"
                        : ""}
                </p>
            </div>
        </Tile>
    </div>
    <div className="w-full h-fit">
        <Tile title="Pending Members">
            <div className="py-2 flex flex-wrap">
                {pendingMembers.map((pendingMember) => {
                    return (
                        <p
                            key={pendingMember._id}
                            className="my-1 mr-8 p-3 shadow rounded"
                        >
                            {pendingMember._id}
                        </p>
                    );
                })}
                <p className="text-sm text-gray-700/70">
                    {pendingMembers.length == 0
                        ? "No pending members"
                        : ""}
                </p>
            </div>
        </Tile>
    </div>
</div>
*/

function DeleteOrgPopup({ orgID }) {
    const closePanel = dialogueStore((store) => store.closePanel);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const confirmationTextBarRef = useRef(null);
    const randomString = useRef(null);

    const deleteOrganization = () => {
        fetch(process.env.API_URL + "/org/" + orgID, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
    };

    const confirmDelete = () => {
        if (confirmationTextBarRef.current.value === randomString.current) {
            deleteOrganization();
            closePanel();
            navigate("/org");
        } else {
            setShowConfirm(false);
            closePanel();
            alert("text did not match");
        }
    };

    return (
        <div className="items-center justify-center text-center">
            <div className={`${showConfirm && "hidden"}`}>
                <p className="text-xl mb-2">Are you sure?</p>
                <div className="flex items-center justify-center">
                    <button
                        className="px-4 mr-7 text-white  rounded bg-rutgers_red
							transition-all duration-100 ease-linear text-lg"
                        onClick={() => {
                            randomString.current = (Math.random() + 1)
                                .toString(36)
                                .substring(6);
                            setShowConfirm(true);
                        }}
                    >
                        Yes
                    </button>
                    <button
                        className="px-4 text-white  rounded bg-rutgers_red transition-all duration-100 ease-linear text-lg"
                        onClick={closePanel}
                    >
                        No
                    </button>
                </div>
            </div>
            <div
                className={`flex flex-col items-center justify-center ${showConfirm || "hidden"}`}
            >
                <p className="text-md mb-2">
                    Type these characters and confirm:
                </p>
                <p className="text-xl mb-2 select-none">
                    {randomString.current}
                </p>
                <div className="flex flex-wrap">
                    <input
                        className="shadow appearance-none border rounded w-fit h-9 py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="textfield"
                        ref={confirmationTextBarRef}
                    />
                    <button
                        className="px-4 py-1.5 mr-7 text-white  rounded bg-rutgers_red
							transition-all duration-100 ease-linear "
                        onClick={confirmDelete}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrgOwner;
