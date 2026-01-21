import React, { useState, useEffect, useRef } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import Tile from "@primitives/tile";
import RedButton from '@components/utils/red-button';
import RutgersLogoUrl from "../assets/RU_SHIELD_BLACK.png";
import CollaboratorsContainer from "@components/utils/collaborator-container";
import { useNavigate, useParams } from "react-router-dom";
import userStore from '@store/userStore';
import Cookies from "js-cookie";
const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
import "react-day-picker/style.css";

// TODO: The type for `dateRange` is *not* consistent.

function CreateMeeting({ isOrganizationOwned = false }) {
    console.log('re-render')
    const [dateRange, setDateRange] = useState(() => {
        // this function sets the default date range to be the current week

        const start = new Date();
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);
        start.setMilliseconds(0);
        const base = [
            {
                startDate: start,
                endDate: null,
                key: "selection",
            },
        ];
        base[0].endDate = new Date(
            base[0].startDate.valueOf() + 1000 * 60 * 60 * 24 * 6
        );
        return base;
    });
    const userHook = userStore((store) => store.getUserData);
    const {orgID} = useParams();
    const navigate = useNavigate();
    async function createCalendar() {
        console.log('creating calendar')
        const payload = {};

        const startTime = startTimeRef.current.value.split(":");
        const startHour = parseInt(startTime[0]);
        const startMinute = parseInt(startTime[1]);

        const endTime = endTimeRef.current.value.split(":");
        // 12:00 AM next day
        if (endTime[0] === '00' && endTime[1] === '00') {
            endTime[0] = '24'
        }

        const endHour = parseInt(endTime[0]);
        const endMinute = parseInt(endTime[1]);

        const timeArr = [];

        const endDay = dateRange[0].endDate;
        const maxEndOfCalendar = endDay;
        maxEndOfCalendar.setDate(endDay.getDate() + 1);

        const cursor = dateRange[0].startDate;

        while (cursor < maxEndOfCalendar) {
            const start = new Date(cursor);
            start.setHours(startHour)
            start.setMinutes(startMinute)

            const end = new Date(cursor)
            end.setHours(endHour)
            end.setMinutes(endMinute)

            timeArr.push({
                start: start.valueOf(),
                end: end.valueOf()
            });

            cursor.setDate(cursor.getDate() + 1)
        }

        payload.timeblocks = timeArr

        if (locationRef.current.value !== '')
            payload.location = locationRef.current.value

        if (nameInputRef.current.value !== '')
            payload.name = nameInputRef.current.value

        if (isOrganizationOwned) {
            payload.owner = {
                type: "organization",
                id: orgID,
            };
        }

        const resp1 = await fetch(process.env.API_URL + "/cal", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        const resp1_json = await resp1.json()

        if (resp1_json.Status !== 'ok') {
            console.log('error creating calendar')
            return;
        }

        const pendingUsers = [];
        for (let i = 1; i < collaborators.length; i++) {
            pendingUsers.push(collaborators[i].netID);
        }

        if (pendingUsers.length > 0) {
            const shareResp = await fetch(process.env.API_URL + "/cal/" + resp1_json.calendar._id + "/share",
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
            )
            const shareRespJSON = await shareResp.json()
            if (shareRespJSON.Status !== 'ok')
                console.log('error sharing users')
        }
        userHook();
        navigate(`/cal/${resp1_json.calendar._id}`);
    }


    const [collaborators, setCollaborators] = useState([]);
    const netid = userStore((store)=>store._id)
    const name_info = userStore((store)=>store.name)
    useEffect(()=>{
        setCollaborators([
            {
                name: name_info.first + " " + name_info.last,
                netID: netid,
            },
        ])
    },[])

    const collaboratorTextBoxRef = useRef(null)
    const collaboratorButtonRef = useRef(null)
    const [collaboratorInputEnabled, setCollaboratorInputEnabled] = useState(true)
    const [collaboratorErrorCode, setCollaboratorErrorCode] = useState(0);
    async function addCollaborator() {
        setCollaboratorInputEnabled(false)
        const netidToAdd = collaboratorTextBoxRef.current.value;
        const netidInCollaborators = collaborators.some((collaborator) => collaborator.netID === netidToAdd)
        if (netidInCollaborators) {
            setCollaboratorErrorCode(1)
            setCollaboratorInputEnabled(true)
            return
        }

        const resp = await fetch(process.env.API_URL + "/user/" + netidToAdd, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        })
        const resp_json = await resp.json()
        console.log(resp_json)
        if (resp_json.Status !== 'ok') {
            setCollaboratorErrorCode(2)
            setCollaboratorInputEnabled(true)
            return;
        }
        const addedUser = resp_json.data
        const newCollaboratorList = [
            ...collaborators,
            {
                name: addedUser.name.first + " " + addedUser.name.last,
                netID: addedUser._id,
            },
        ];
        setCollaborators(newCollaboratorList);
        setCollaboratorInputEnabled(true)
    }

    const [validName, setValidName] = useState(true);
    const nameInputRef = useRef(null);
    function validateName() {
        setValidName(nameInputRef.current.value.length < 20);
    }

    const [validTime, setValidTime] = useState(true);
    const startTimeRef = useRef(null);
    const endTimeRef = useRef(null);
    function validate_time() {
        const start = startTimeRef.current.value;
        const end = endTimeRef.current.value;
        //12:00AM in ending is always ok
        setValidTime(end === '00:00' || start < end);
    }

    const locationRef = useRef(null);
    const defaultCalendarCSS = getDefaultClassNames();

    const [good_to_create, set_good_to_create] = useState(true);

    return (
        <div className="w-full h-full bg-gray-100 flex flex-col items-center grow">
            <div className="w-full font-bold text-3xl text-center mb-6 mt-10">
                Create A New Meeting
            </div>
            <div
                className="flex flex-col xl:flex-row w-full h-fit"
                style={{
                    maxWidth: "100rem",
                    minWidth: "25rem",
                }}
            >
                <div className="flex flex-col sm:flex-row xl:flex-col">
                    <div className="sm:grow xl:grow-0 items-stretch flex flex-col">
                        <Tile>
                            <div className="bg-white p-4 w-full h-full">
                                <label className="text-gray-600 font-bold">
                                    Name
                                </label>
                                <input type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                    placeholder='untitled'
                                    onChange={validateName}
                                    ref={nameInputRef}
                                />
                                <p class={`${validName ? 'invisible' : ''} text-xs text-rose-600`}>
                                    Error: Name is over 20 characters
                                </p>
                            </div>
                        </Tile>
                    </div>
                    <div className="w-auto sm:w-1/2 xl:w-auto -mt-2 sm:mt-0 xl:-mt-2">
                        <Tile>
                            <div className="bg-white p-4 w-full h-full">
                                <label className="text-gray-600 font-bold">
                                    Location
                                </label>
                                <input type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                    ref={locationRef}
                                />
                            </div>
                        </Tile>
                        <Tile>
                            <div className="grid bg-white w-full h-full p-4">
                                <p style={{ gridColumn: 1, gridRow: 1 }}>
                                    Start
                                </p>
                                <div style={{ gridColumn: 1, gridRow: 2 }}>
                                    <input
                                        ref={startTimeRef}
                                        type="time"
                                        defaultValue="09:00"
                                        onChange={(e) => {
                                            validate_time();
                                        }}
                                        step="3600000"
                                    />
                                </div>
                                <div style={{ gridColumn: 2 }}>End</div>
                                <div style={{ gridColumn: 2, gridRow: 2 }}>
                                    <input
                                        ref={endTimeRef}
                                        type="time"
                                        defaultValue="17:00"
                                        onChange={(e) => {
                                            validate_time();
                                        }}
                                        step="3600000"
                                    />
                                </div>
                                <p class={`${validTime ? 'invisible' : ''} text-xs text-rose-600`}>
                                    Error: Start time occurs before end time
                                </p>
                            </div>
                        </Tile>
                    </div>
                </div>
                <div className="lg:grow h-full flex flex-col">
                    <Tile>
                        <div className="bg-white w-full h-full p-4">
                            <p className="text-gray-600 font-bold">
                                Choose Your Days
                            </p>
                            <div className="w-full flex justify-center">
                                <DayPicker 
                                    //bg-red-500
                                    mode="range"
                                    startMonth={ Date() }
                                    disabled={{ before: Date() }}
                                    range_start="range-start"
                                    range_end="range-end"
                                    range_middle="range-middle"
                                    classNames={{
                                        month_grid: `border-separate border-spacing-y-0.5`,
                                        day_button: `w-full h-full font-normal text-base`,
                                    }}
                                    modifiersClassNames={{
                                        range_start: `bg-rutgers_red rounded-l-md`,
                                        range_middle: `bg-rutgers_red/30`,
                                        range_end: `bg-rutgers_red rounded-r-md`,
                                    }}
                                    required
                                    excludeDisabled
                                    fixedWeeks
                                    captionLayout="dropdown"
                                />
                            </div>
                        </div>
                    </Tile>
                </div>

                <div
                    className="flex flex-col sm:flex-row xl:flex-col items-stretch xl:mb-0"
                    style={{
                        minWidth: "25rem",
                    }}
                >
                    <Tile>
                        <div className="bg-white p-4">
                            <p className="text-gray-600 font-bold">
                                Invite your collaborators
                            </p>
                            <CollaboratorsContainer collaborators={collaborators} />
                            <div className="flex justify-center space-x-4 items-start mt-3">
                                <div className="grow">
                                    <input type="text" disabled={!collaboratorInputEnabled} className="disabled:bg-amber-500 w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                        ref={collaboratorTextBoxRef}
                                        onChange={() => { if (collaboratorErrorCode !== 0) setCollaboratorErrorCode(0) }}
                                    />
                                    <div className="grid">
                                        <p class={`${collaboratorErrorCode === 1 ? '' : 'invisible'} text-xs text-rose-600`} style={{ gridColumn: 1, gridRow: 1 }}>
                                            Duplicate NetID
                                        </p>
                                        <p class={`${collaboratorErrorCode === 2 ? '' : 'invisible'} text-xs text-rose-600`} style={{ gridColumn: 1, gridRow: 1 }}>
                                            Invalid NetID
                                        </p>
                                    </div>
                                </div>
                                <RedButton
                                    onClick={addCollaborator}
                                    ref={collaboratorButtonRef}
                                    className="disabled:bg-amber-500 py-2"
                                    disabled={!collaboratorInputEnabled}
                                >
                                    <p >+&nbsp;Invite</p>
                                </RedButton>
                            </div>
                        </div>
                    </Tile>
                    <div className="flex flex-col">
                        <div className="w-full flex justify-center">
                            <RedButton
                                onClick={createCalendar}
                                disabled={false}
                                className='disabled:bg-gray-300 text-white disabled:text-black'
                            >
                                <p className="text-center font-bold m-4">
                                    Create A New Meeting
                                </p>
                            </RedButton>
                        </div>
                        <div className="w-full grow justify-center items-center hidden sm:flex xl:hidden mb-8">
                            <img
                                src={RutgersLogoUrl}
                                alt="Rutgers Logo"
                                className="w-auto h-24 opacity-40 "
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateMeeting;
