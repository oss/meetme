import { useState } from "react";

import HeadlessDialogue from "../../utils/headless-dialogue";
import TextField from "../../utils/text-field";
import { getUser } from "../../../utils";
import { CalendarAPI } from "../../../api/calendar-api";
import DropdownMenu from "../../utils/dropdown-menu";

export default function InvitePopup({
    setIsOpen,
    isOpen,
    members,
    setMembers,
    calendarID,
    loadGlobalTimeline
}: {
    setIsOpen: (isOpen: boolean) => void;
    isOpen: boolean;
    members: string[];
    setMembers: (members: string[]) => void;
    calendarID: string;
    loadGlobalTimeline: () => void;
}) {
    let [netID, setNetID] = useState("");
    let [inviteList, setInviteList] = useState([]);

    async function isValidNetid(netid: string) {
        if (netID == "" || getUser().uid == netID) return false;
        let data = await fetch(process.env.API_URL + "/user/" + netid, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json());
        return data.Status == "ok";
    }

    async function addUserToInviteList() {
        let isValid = await isValidNetid(netID);
        if (isValid) {
            if (inviteList.includes(netID)) return;
            setInviteList([...inviteList, netID]);
        } else {
        }
    }
    async function inviteUsers(inviteList: string[]) {
        let data: any = await CalendarAPI.shareCalendar(calendarID, inviteList);
        if (data.Status == "ok") {
            setInviteList([]);
        } else {
            console.log(data);
            console.log({ inviteList });
            alert(data.Error);
        }
    }

    return (
        <HeadlessDialogue
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Invite Collaborators"
        >
            <div className="w-full flex flex-wrap justify-center items-center max-h-32 max-w-[32rem] overflow-y-auto overflow-x-hidden">
                {inviteList.map((netID) => {
                    return (
                        <div className="flex items-center justify-between w-fit pl-3 py-1 border border-gray-300 rounded-full mx-1 mt-3">
                            <p title={netID} className="text-gray-500 w-20 truncate">{netID}</p>
                            <div
                                onClick={() => {
                                    setInviteList(
                                        inviteList.filter((id) => id != netID)
                                    );
                                }}
                                className="h-[20px] w-[20px] cursor-pointer
                             text-gray-800 transition-all ease-linear hover:text-gray-500 flex items-center justify-center mx-1"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                        </div>
                    );
                })}
            </div>
            {inviteList.length != 0 && (
                <div className="w-full flex justify-center my-2">
                    <button
                        onClick={() => {
                            inviteUsers(inviteList);
                        }}
                        className="w-fit px-2 py-1 bg-red-500 hover:bg-red-600 transition-colors ease-linear text-white rounded"
                    >
                        Send
                    </button>
                </div>
            )}
            {inviteList.length == 0 && (
                <div className="flex flex-col my-4">
                    <p>People with access</p>
                    {members.map((netID) => {
                        return (
                            <div className="flex justify-between">
                                <p className="text-gray-500">{netID}</p>
                                <DropdownMenu
                                    menuItems={["Remove"]}
                                    menuItemFunctions={[
                                        async () => {
                                            let data =
                                                await CalendarAPI.removeAccess(
                                                    calendarID,
                                                    netID
                                                );
                                            if (data.Status == "ok") {
                                                setMembers(
                                                    members.filter(
                                                        (id) =>
                                                            !data.user_list.removed.includes(
                                                                id
                                                            )
                                                    )
                                                );
                                                loadGlobalTimeline();
                                            }
                                        },
                                    ]}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
            <div className="w-full flex">
                <div className="w-3/4">
                    <TextField
                        placeholder={"text"}
                        id=""
                        defaultValue={""}
                        onChange={(e) => {
                            setNetID(e.target.value);
                        }}
                        enter_shortcut={addUserToInviteList}
                    />
                </div>
                <button
                    onClick={addUserToInviteList}
                    className="w-1/4 mx-4 bg-red-500 hover:bg-red-600 transition-colors ease-linear text-white rounded"
                >
                    Add
                </button>
            </div>
        </HeadlessDialogue>
    );
}
