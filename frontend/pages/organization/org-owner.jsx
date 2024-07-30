import { useState, useRef } from "react";
import Tile from "@components/utils/tile";
import { Link } from "react-router-dom";
import { Dialogue } from "@components/utils/popup-dialogue";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import DropdownMenu from "@components/utils/dropdown-menu";
import HeadlessDialogue from "@components/utils/headless-dialogue";
import TextField from "@components/utils/text-field";
import Button from "@components/utils/button";

function OrgOwner({
    calendars,
    members,
    pendingMembers,
    orgData,
    setCalendars,
    setPendingMembers,
}) {
    const [userID, setUserID] = useState("");
    const [calendarName, setCalendarName] = useState("");
    const [confirmDelete, toggleConfirmDelete] = useState(false);
    const [showRenameDialogue, setShowRenameDialogue] = useState(false);
    const navigate = useNavigate();

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
        })
        const resp_json = await resp.json()
        if (resp_json.Status !== 'ok') {
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
            }
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

    let deleteOrganization = () => {
        fetch(process.env.API_URL + "/org/" + orgData.organization._id, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                navigate("/org");
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
                        })
                    );
                }
            });
    }

    return (
        <div className="h-full bg-neutral-100 flex justify-center">
            <div className="w-10/12">
                <div className="flex flex-col items-center my-4">
                    <p className="mx-2 text-3xl bg-white rounded font-semibold px-3 py-2 shadow-sm mb-3">
                        {orgData.organization.name}
                    </p>
                    <button
                        onClick={() => {
                            toggleConfirmDelete(true);
                        }}
                        className="bg-rutgers_red rounded px-3 py-2 text-white transition-all 
                                                    duration-100 ease-in-out hover:bg-red-600"
                    >
                        {" "}
                        Delete Organization
                    </button>
                </div>
                <DeletePopup
                    onClickNo={() => {
                        toggleConfirmDelete(false);
                    }}
                    visible={confirmDelete}
                    setVisible={toggleConfirmDelete}
                    onClickYes={() => {
                        deleteOrganization();
                    }}
                />
                <div className="w-full md:grid md:grid-cols-2 md:gap-5">
                    <div className="w-full h-full">
                        <Tile title="Members" fullHeight={true}>
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
                    </div>
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
            </div>
        </div>
    );
}

function DeletePopup({ onClickNo, visible, onClickYes, setVisible }) {
    let [showConfirm, setShowConfirm] = useState(false);

    let [randomString, setRandomString] = useState("");

    let inputConfirm = useRef(null);

    function confirmDelete() {
        if (inputConfirm.current.value === randomString) {
            onClickYes();
        } else {
            setShowConfirm(false);
            onClickNo();
            alert("text did not match");
        }
    }

    return (
        <div
            className={
                "flex flex-col items-center justify-center " +
                (visible ? "" : `hidden `)
            }
        >
            <HeadlessDialogue isOpen={visible} setIsOpen={setVisible}>
                <div className="flex flex-col items-center justify-center min-w-fit bg-white rounded m-1 p-5">
                    <div className={showConfirm ? " hidden" : ""}>
                        <p className="text-xl mb-2">Are you sure?</p>
                        <div className={"flex "}>
                            <button
                                className="px-4 mr-7 text-white  rounded bg-rutgers_red
							transition-all duration-100 ease-linear text-lg"
                                onClick={() => {
                                    setShowConfirm(true);
                                    setRandomString(
                                        (Math.random() + 1)
                                            .toString(36)
                                            .substring(6)
                                    );
                                }}
                            >
                                Yes
                            </button>
                            <button
                                className="px-4 text-white  rounded bg-rutgers_red
							transition-all duration-100 ease-linear text-lg"
                                onClick={onClickNo}
                            >
                                No
                            </button>
                        </div>
                    </div>
                    <div
                        className={
                            "flex flex-col items-center justify-center " +
                            (!showConfirm ? " hidden" : "")
                        }
                    >
                        <p className="text-md mb-2">
                            Type these characters and confirm:
                        </p>
                        <p className="text-xl mb-2 select-none">
                            {randomString}
                        </p>
                        <div className="flex flex-wrap">
                            <input
                                ref={inputConfirm}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        addCalendar();
                                    }
                                }}
                                className="shadow appearance-none border rounded w-fit h-9 py-1 px-3 text-gray-700 
                                            leading-tight focus:outline-none focus:shadow-outline"
                                type="textfield"
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
            </HeadlessDialogue>
        </div>
    );
}

export default OrgOwner;
