import React, { useState, useEffect } from "react";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRangePicker } from "react-date-range";
import LargeButton from "../components/utils/large-button";
import Tile from "../components/utils/tile";
import Button from "../components/utils/button";
import RutgersLogoUrl from "../assets/RU_SHIELD_BLACK.png";
import CollaboratorsContainer from "../components/utils/collaborator-container";
import TextField from "../components/utils/text-field"; //replace this
import { useNavigate, useParams } from "react-router-dom";
import uniqid from "uniqid";
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

// TODO: The type for `dateRange` is *not* consistent.

function CreateMeeting({ isOrganizationOwned = false }) {
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

    let orgID = null;
    if (isOrganizationOwned) {
        orgID = useParams().orgID;
    }

    const [collaborators, setCollaborators] = useState(() => {
        let userinfo = JSON.parse(atob(Cookies.get("session"))).passport.user;
        return [
            {
                name: userinfo.firstName + " " + userinfo.lastName,
                netID: userinfo.uid,
                profileColor: "red",
            },
        ];
    });

    const [invite_collab_status, set_invite_collab_status] = useState({
        status: "normal",
        message: "",
    });

    const navigate = useNavigate();
    function create_cal() {
        const payload = {};
        let start_offset = document
            .getElementById("cal_day_start_time")
            .value.split(":");
        // 9:00 --> hour = 9,minute  = 0

        let startHour = parseInt(start_offset[0]);
        let startMinute = parseInt(start_offset[1]);
        startMinute = Math.floor(startMinute / 5) * 5;

        let startTime = (startHour * 60 + startMinute) * 1000 * 60;
        // milliseconds since the beginning of the day

        let end_offset = document
            .getElementById("cal_day_end_time")
            .value.split(":");

        let endHour = parseInt(end_offset[0]);
        let endMinute = parseInt(end_offset[1]);
        endMinute = Math.ceil(endMinute / 5) * 5;

        let endTime = (endHour * 60 + endMinute) * 1000 * 60;

        const time_arr = [];

        let cursor = dateRange[0].startDate.valueOf();
        let max_end_of_calendar =
            dateRange[0].endDate.valueOf() + 1000 * 60 * 60 * 24;

        while (cursor < max_end_of_calendar) {
            time_arr.push({
                start: cursor + startTime,
                end: cursor + endTime,
            });

            // have to account for hours in a day due to daylight savings
            let currentDay = new Date(time_arr[time_arr.length - 1].start);
            let nextDay = new Date(currentDay);
            nextDay.setDate(currentDay.getDate() + 1);
            cursor +=
                1000 * 60 * 60 * 24 -
                1000 *
                60 *
                (currentDay.getTimezoneOffset() -
                    nextDay.getTimezoneOffset());
        }

        payload.timeblocks = time_arr;

        /*
        for(let i=0;i<time_arr.length;i++){
            time_arr[i].start = new Date(time_arr[i].start);
            time_arr[i].end = new Date(time_arr[i].end);
        }
        console.log(time_arr);
        */

        let cal_title = document.getElementById(title_id).value;
        if (cal_title !== "") payload.name = cal_title;
        let location = document.getElementById(location_id).value;
        if (location !== "" && location.length < 20)
            payload.location = location;
        if (isOrganizationOwned) {
            payload.owner = {
                type: "organization",
                id: orgID,
            };
        }
        if (cal_title.length < 20) {
            fetch(process.env.API_URL + "/cal", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
                .then((res) => res.json())
                .then((data) => {
                    let calendar_id = data.calendar._id;
                    let pendingUsers = [];
                    for (let i = 1; i < collaborators.length; i++) {
                        pendingUsers.push(collaborators[i].netID);
                    }
                    if (pendingUsers.length > 0) {
                        fetch(
                            process.env.API_URL +
                            "/cal/" +
                            calendar_id +
                            "/share",
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
                            .then((res) => res.json())
                            .then((data) => {
                                console.log(data);
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    } else {
                        console.log(data);
                    }
                    navigate(`/cal/${data.calendar._id}`);
                });
        }
    }

    function add_collaborator() {
        const netid_to_add = document.getElementById(collaborator_id).value;
        if (
            collaborators.some((collaborator) => {
                return collaborator.netID === netid_to_add;
            })
        ) {
            set_invite_collab_status({
                status: "error",
                message: "User is already added",
            });
            return;
        }

        fetch(process.env.API_URL + "/user/" + netid_to_add, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === "ok") {
                    let added_user = data.data;
                    const new_arr = [
                        ...collaborators,
                        {
                            name:
                                added_user.name.first +
                                " " +
                                added_user.name.last,
                            netID: added_user._id,
                            profileColor: "green",
                        },
                    ];
                    setCollaborators(new_arr);
                } else {
                    set_invite_collab_status({
                        status: "error",
                        message: "User does not exist",
                    });
                }
            });
    }
    const [valid_name, set_name_valid] = useState(true);
    function validate_name() {
        console.log("validating");

        set_name_valid(title_id.length < 20);
    }

    const [valid_time, set_time_valid] = useState(true);
    function validate_time() {
        console.log("validating");
        const start = document.getElementById("cal_day_start_time").value;
        const end = document.getElementById("cal_day_end_time").value;
        set_time_valid(start < end);
    }

    const [good_to_create, set_good_to_create] = useState(true);
    useEffect(() => {
        //for the returns here there should be some error
        //handeling not just like a return
        if (!valid_time) {
            set_good_to_create(false);
            return;
        }
        if (title_id.length > 20) {
            set_good_to_create(false);
            return;
        }
        if (location_id.length > 20) {
            set_good_to_create(false);
            return;
        }
        if (title_id == null) {
            set_good_to_create(false);
            return;
        }
        set_good_to_create(true);
    }, [valid_time]);

    const title_id = uniqid();
    const location_id = uniqid();
    const collaborator_id = uniqid();
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
                        <Tile title="Name Your Meeting" grow verticallyCenter>
                            <TextField
                                label="standard"
                                variant="standard"
                                placeholder={"untitled"}
                                className="w-full"
                                id={title_id}
                            />
                            {valid_name ? (
                                <div class="text-xs">&nbsp;</div>
                            ) : (
                                <div class="text-xs text-rose-600">
                                    Error: Name is over 20 characters
                                </div>
                            )}
                        </Tile>
                    </div>
                    <div className="w-auto sm:w-1/2 xl:w-auto -mt-2 sm:mt-0 xl:-mt-2">
                        <Tile title="Location">
                            <TextField
                                label="standard"
                                variant="standard"
                                className="w-full"
                                id={location_id}
                            />
                        </Tile>
                        <Tile title="Times">
                            <div style={{ display: "grid" }}>
                                <div style={{ gridColumn: 1, gridRow: 1 }}>
                                    Start
                                </div>
                                <div style={{ gridColumn: 1, gridRow: 2 }}>
                                    <input
                                        id="cal_day_start_time"
                                        type="time"
                                        defaultValue="09:00"
                                        onChange={(e) => {
                                            e.target.value = e.target.value.split(":")[0] + ":00";
                                            validate_time();
                                        }}
                                        step="3600000"
                                    />
                                </div>
                                <div style={{ gridColumn: 2 }}>End</div>
                                <div style={{ gridColumn: 2, gridRow: 2 }}>
                                    <input
                                        id="cal_day_end_time"
                                        type="time"
                                        defaultValue="17:00"
                                        onChange={(e) => {
                                            e.target.value = e.target.value.split(":")[0] + ":00";
                                            validate_time();
                                        }}
                                        step="3600000"
                                    />
                                </div>
                            </div>
                            {valid_time ? (
                                <div class="text-xs">&nbsp;</div>
                            ) : (
                                <div class="text-xs text-rose-600">
                                    Error: Start time occurs before end time
                                </div>
                            )}
                        </Tile>
                    </div>
                </div>
                <div className="lg:grow h-full flex flex-col">
                    <Tile
                        title="Choose Your Days"
                        subtitle="What days would you like to make available for scheduling?"
                        fullHeight
                    >
                        <div>
                            Choose specific days for accurate availability
                        </div>
                        <div className="w-full flex justify-center">
                            <DateRangePicker
                                onChange={(item) =>
                                    setDateRange([item.selection])
                                }
                                showSelectionPreview
                                moveRangeOnFirstSelection={false}
                                months={1}
                                ranges={dateRange}
                                direction="vertical"
                            />
                        </div>
                        <div className="text-gray-500">
                            Or choose days of the week for repeated
                            availability.
                        </div>
                        <div
                            className="w-full grow grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-4
                            grid-rows-4 lg:grid-rows-2 auto-cols-max"
                        >
                            {DAYS.map((day) => (
                                <div key={day} className="mr-4">
                                    <Button text={day} key={day} fullWidth />
                                </div>
                            ))}
                        </div>
                    </Tile>
                </div>
                <div
                    className="flex flex-col sm:flex-row xl:flex-col items-stretch mb-16 xl:mb-0"
                    style={{
                        minWidth: "25rem",
                    }}
                >
                    <Tile title="Invite Your Collaborators" grow>
                        <CollaboratorsContainer collaborators={collaborators} />
                        <div className="flex justify-center space-x-4 items-start mt-3">
                            <TextField
                                label="standard"
                                variant="standard"
                                error_status={invite_collab_status}
                                fullWidth
                                id={collaborator_id}
                                enter_shortcut={add_collaborator}
                            />
                            <Button
                                text="+&nbsp;Invite"
                                red
                                click_passthrough={add_collaborator}
                            />
                        </div>
                    </Tile>
                    <div className="flex flex-col">
                        <Tile title="Finish and Create Your Meeting">
                            <div className="w-full flex justify-center">
                                <LargeButton
                                    text="Create A New Meeting"
                                    click_passthrough={create_cal}
                                    disabled={!good_to_create}
                                />
                            </div>
                        </Tile>
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
