import React, { useState, useEffect } from 'react';
import UserCalendar from '../../components/utils/calendar/user-calendar';
import GlobalCalendar from '../../components/utils/calendar/global-calendar';
import Tile from '../../components/utils/tile';
import uniqid from 'uniqid';
import TextField from '../../components/utils/text-field';
import Button from '../../components/utils/button';
import { Dialogue } from '../../components/utils/popup-dialogue';
import renderCollabatorsList from '../../components/member-list';

function CalendarEditor({
    metadata,
    maindata,
    meetme,
    memberlist,
    timeline,
    timeblocks,
    meeting_time,
    timeline_setstate,
    org_memberlist = null,
    can_kick_users = true,
}) {
    const [display_invite_dialogue, set_invite_dialogue] = useState(false);
    const mainbody_id = uniqid();
    const collaborator_id = uniqid();

    function getScrollbarWidth() {
    // Creating invisible container
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // forcing scrollbar to appear
        outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
        document.body.appendChild(outer);

        // Creating inner element and placing it in the container
        const inner = document.createElement('div');
        outer.appendChild(inner);

        // Calculating difference between container's full width and the child width
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

        // Removing temporary elements from the DOM
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    }
    useEffect(() => {
        if (display_invite_dialogue) {
            let scroll = getScrollbarWidth();
            console.log(scroll);
            document.getElementById('navbar_wrapper').style.borderRightWidth =
        scroll + 'px';
            document.getElementById(mainbody_id).style.borderRightWidth =
        scroll + 'px';
            document.body.style.overflow = 'hidden';
        } else {
            document.getElementById('navbar_wrapper').style.borderRightWidth = '0px';
            document.getElementById(mainbody_id).style.borderRightWidth = '0px';
            document.body.style.overflow = 'auto';
        }
    }, [display_invite_dialogue]);

    const [pendingMemberList, setPendingMemberList] = useState([]);
    function add_collaborators() {
        let netid_to_add = document.getElementById(collaborator_id).value;
        if (pendingMemberList.indexOf(netid_to_add) < 0)
            setPendingMemberList([...pendingMemberList, netid_to_add]);
    }

    function remove_collaborator(document_id) {
        const netid = document.getElementById(document_id).textContent;
        console.log(netid);
        const index = pendingMemberList.indexOf(netid);
        pendingMemberList.splice(index, 1);
        setPendingMemberList([...pendingMemberList]);
    }

    function final_meeting_time_tile_body() {
        return (
            <div>
                {meeting_time.start !== null && meeting_time.end !== null ? (
                    <div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                            onClick={() => {
                                set_display_final_meeting_dialogue(true);
                            }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p>Start: {new Date(meeting_time.start).toString()}</p>
                        <p>End: {new Date(meeting_time.end).toString()}</p>
                    </div>
                ) : (
                    'No meeting time has been set'
                )}
            </div>
        );
    }

    function location_tile_body() {
        return metadata.location === null ? (
            'No location set'
        ) : (
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                    onClick={() => {
                        set_display_location_dialogue(true);
                    }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                </svg>
                {metadata.location}
            </div>
        );
    }

    const [dialogue_menu, set_dialogue_menu] = useState('default');
    const [invite_response, set_invite_response] = useState({});
    function invite_dialogue() {
        let body = null;
        switch (dialogue_menu) {
        case 'default':
            body = (
                <div className="justify-center w-3/4 px-8 py-5 mx-2 my-2 bg-white rounded-md shadow-sm ">
                    <button
                        onClick={() => {
                            setPendingMemberList([]);
                            set_invite_dialogue(false);
                        }}
                    >
              close
                    </button>
                    <div class="flex flex-wrap gap-x-1">
                        {pendingMemberList.map((netid) => {
                            const item_status_id = uniqid();
                            const netid_target = uniqid();
                            fetch(process.env.API_URL + '/user/' + netid, {
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            })
                                .then((res) => res.json())
                                .then((data) => {
                                    if (data.Status === 'ok') {
                                        document.getElementById(item_status_id).className =
                        'items-center inline rounded-full material-symbols-outlined md-18';
                                        document.getElementById(item_status_id).textContent =
                        'check_circle';
                                    } else {
                                        document.getElementById(item_status_id).className =
                        'items-center inline rounded-full material-symbols-outlined md-18';
                                        document.getElementById(item_status_id).textContent =
                        'error_outline';
                                    }
                                });
                            return (
                                <div class="leading-5 py-1 px-1 border-2 text-slate-500 rounded-full shadow-sm flex">
                                    <span
                                        id={item_status_id}
                                        class="material-icons rounded-full md-18 inline items-center"
                                    >
                      pending
                                    </span>
                                    <div class="inline flex items-center">
                                        <div id={netid_target}>{netid}</div>
                                    </div>
                                    <span style={{ width: '15px' }}></span>
                                    <button
                                        class="inline"
                                        onClick={() => {
                                            remove_collaborator(netid_target);
                                        }}
                                    >
                      x
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-center mt-3 space-x-4">
                        <TextField
                            label="standard"
                            variant="standard"
                            fullWidth
                            id={collaborator_id}
                            enter_shortcut={add_collaborators}
                        />
                        <Button
                            text="Done"
                            red
                            click_passthrough={() => {
                                set_dialogue_menu('loading');
                            }}
                        />
                    </div>
                </div>
            );
            break;
        case 'loading':
            body = (
                <span class="animate-spin material-symbols-outlined md-48">
            autorenew
                </span>
            );
            fetch(process.env.API_URL + '/cal/' + metadata._id + '/share', {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_users: pendingMemberList,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    set_invite_response(data);
                    set_dialogue_menu('finished');
                });
            break;
        case 'finished':
            body = (
                <div className="justify-center w-3/4 px-8 py-5 mx-2 my-2 bg-white rounded-md shadow-sm ">
                    <button
                        onClick={() => {
                            set_invite_dialogue(false);
                            set_dialogue_menu('default');
                            setPendingMemberList([]);
                        }}
                    >
              close
                    </button>
                    <div>{JSON.stringify(invite_response)}</div>
                </div>
            );
            break;
        }
        return (
            <div
                class="bg-slate-400/50 h-screen w-full"
                style={{ position: 'fixed', top: 0, right: 0 }}
            >
                <div class="h-screen w-full flex items-center justify-center">
                    {body}
                </div>
            </div>
        );
    }

    const [display_location_dialogue, set_display_location_dialogue] =
    useState(false);
    const [
        display_location_dialogue_display,
        set_display_location_dialogue_display,
    ] = useState('default');
    const location_dialogue_id = uniqid();
    function location_dialogue() {
        let body = null;
        switch (display_location_dialogue_display) {
        case 'default':
            body = (
                <div className="justify-center w-3/4 px-8 py-5 mx-2 my-2 bg-white rounded-md shadow-sm ">
                    <button
                        onClick={() => {
                            set_display_location_dialogue(false);
                        }}
                    >
              close
                    </button>
                    <TextField id={location_dialogue_id} />
                    <button
                        onClick={() => {
                            fetch(
                                process.env.API_URL + '/cal/' + metadata._id + '/location',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        location:
                        document.getElementById(location_dialogue_id).value,
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                    set_display_location_dialogue(false);
                                });
                        }}
                    >
              set location
                    </button>
                </div>
            );
            break;
        }
        return <Dialogue>{body}</Dialogue>;
    }

    const [display_final_meeting_dialogue, set_display_final_meeting_dialogue] =
    useState(false);
    const [ok_to_set_time, set_ok_to_set_time] = useState(true);
    function final_meeting_dialogue() {
        const start = uniqid();
        const end = uniqid();
        const start_date = uniqid();
        const end_date = uniqid();

        function validate_time() {
            // hour:minute
            const start_time = document.getElementById(start).value;
            const start_time_arr = /(\d+)\:(\d+)/.exec(start_time);
            const end_time = document.getElementById(end).value;
            const end_time_arr = /(\d+)\:(\d+)/.exec(end_time);

            // year-month-day
            const start_day = document.getElementById(start_date).value;
            const start_day_arr = /(\d+)\-(\d+)\-(\d+)/.exec(start_day);
            const end_day = document.getElementById(end_date).value;
            const end_day_arr = /(\d+)\-(\d+)\-(\d+)/.exec(end_day);

            const date_start = new Date();
            date_start.setFullYear(
                start_day_arr[1],
                start_day_arr[2] - 1,
                start_day_arr[3]
            );
            date_start.setHours(start_time_arr[1], start_time_arr[2], 0, 0);
            const date_end = new Date();
            date_end.setFullYear(end_day_arr[1], end_day_arr[2] - 1, end_day_arr[3]);
            date_end.setHours(end_time_arr[1], end_time_arr[2], 0, 0);

            if (date_start >= date_end) {
                console.log('end before start');
                set_ok_to_set_time(false);
            } else {
                console.log('time check pass');
                console.log(date_start);
                console.log(date_end);
                let is_between_tb = false;
                for (let i = 0; i < timeblocks.length; i++) {
                    const tb = timeblocks[i];
                    console.log(tb);
                    if (
                        date_start.valueOf() >= tb.start &&
            date_end.valueOf() <= tb.end
                    ) {
                        is_between_tb = true;
                        break;
                    }
                }
                if (is_between_tb) {
                    console.log('ok to push');
                    set_ok_to_set_time(true);
                } else {
                    set_ok_to_set_time(false);
                    console.log('not inside timeblocks');
                }
            }
        }

        return (
            <Dialogue>
                <div className="justify-center w-3/4 px-8 py-5 mx-2 my-2 bg-white rounded-md shadow-sm ">
                    <button
                        onClick={() => {
                            set_display_final_meeting_dialogue(false);
                        }}
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
                    </button>
                    <div className="flex">
                        <div class="w-1/2 text-center">
                            <div>Start</div>
                            <input
                                id={start}
                                type="time"
                                defaultValue={meeting_time.start}
                                onChange={(e) => {
                                    validate_time();
                                }}
                                step="900"
                            />
                            <input
                                id={start_date}
                                type="date"
                                onChange={(e) => {
                                    validate_time();
                                }}
                            />
                        </div>
                        <div class="w-1/2 text-center">
                            <div>End</div>
                            <input
                                id={end}
                                type="time"
                                defaultValue={meeting_time.end}
                                onChange={(e) => {
                                    validate_time();
                                }}
                                step="900"
                            />
                            <input
                                id={end_date}
                                type="date"
                                onChange={(e) => {
                                    validate_time();
                                }}
                            />
                        </div>
                    </div>
                    <div>{!ok_to_set_time ? <p>{ok_to_set_time}</p> : <></>}</div>
                    <button
                        disabled={!ok_to_set_time}
                        onClick={() => {
                            const start_time = document.getElementById(start).value;
                            const start_time_arr = /(\d+)\:(\d+)/.exec(start_time);
                            const end_time = document.getElementById(end).value;
                            const end_time_arr = /(\d+)\:(\d+)/.exec(end_time);

                            // year-month-day
                            const start_day = document.getElementById(start_date).value;
                            const start_day_arr = /(\d+)\-(\d+)\-(\d+)/.exec(start_day);
                            const end_day = document.getElementById(end_date).value;
                            const end_day_arr = /(\d+)\-(\d+)\-(\d+)/.exec(end_day);

                            const date_start = new Date();
                            date_start.setFullYear(
                                start_day_arr[1],
                                start_day_arr[2] - 1,
                                start_day_arr[3]
                            );
                            date_start.setHours(start_time_arr[1], start_time_arr[2], 0, 0);
                            const date_end = new Date();
                            date_end.setFullYear(
                                end_day_arr[1],
                                end_day_arr[2] - 1,
                                end_day_arr[3]
                            );
                            date_end.setHours(end_time_arr[1], end_time_arr[2], 0, 0);

                            fetch(
                                process.env.API_URL + '/cal/' + metadata._id + '/meet_time',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        start: date_start.valueOf(),
                                        end: date_end.valueOf(),
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    set_ok_to_set_time('good');
                                });
                        }}
                    >
            save
                    </button>
                </div>
            </Dialogue>
        );
    }

    return (
        <>
            <div
                className="flex flex-col items-center w-full h-full bg-gray-100 border-gray-100 grow"
                id={mainbody_id}
            >
                <div class="grid grid-cols-[20%_40%_40%] w-full">
                    <div class="col-start-1 row-span-full">
                        <Tile title="Collaborators">
                            <button
                                onClick={() => {
                                    set_invite_dialogue(true);
                                }}
                            >
                +
                            </button>
                            <p class="font-bold text-xs text-slate-400/70">OWNER</p>
                            {renderCollabatorsList('owner')}
                            <p class="font-bold text-xs text-slate-400/70">MEMBERS</p>
                            {renderCollabatorsList('member')}
                            <p class="font-bold text-xs text-slate-400/70">VIEWERS</p>
                            {renderCollabatorsList('viewer')}
                        </Tile>
                        <Tile title="Final Meeting" class="col-start-1">
                            {final_meeting_time_tile_body()}
                        </Tile>
                        <Tile title="Location">
                            <div>{location_tile_body()}</div>
                        </Tile>
                    </div>
                    <div class="col-start-2 row-span-full">
                        <Tile overflowX>
                            <GlobalCalendar
                                meetme_input={meetme}
                                memberlist_input={memberlist}
                            />
                        </Tile>
                    </div>
                    <div class="col-start-3 row-span-full">
                        <Tile overflowX>
                            <UserCalendar
                                meetme_input={meetme}
                                timeline_input={timeline}
                                timeblocks_input={timeblocks}
                                cal_id={metadata._id}
                                timeline_setstate={timeline_setstate}
                            />
                        </Tile>
                    </div>
                </div>
                {display_invite_dialogue ? invite_dialogue() : <></>}
                {display_location_dialogue ? location_dialogue() : <></>}
                {display_final_meeting_dialogue ? final_meeting_dialogue() : <></>}
            </div>
            <p>THIS IS A ORG EDITOR PAGE</p>
        </>
    );
}

export default CalendarEditor;
