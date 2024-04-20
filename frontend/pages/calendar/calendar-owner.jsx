import Tile from '../../components/tile';
import calendarMetadata from '../../store/calendarMetadata';
import calendarMaindata from '../../store/calendarMaindata';

function CalendarOwner({ calID }) {
    const calendarName = calendarMetadata((store)=>store.calendarMetadata[calID].data.name)

    return (
        <div className="flex flex-col items-center w-full h-full bg-gray-100 border-gray-100 grow">
            <div className="grid grid-cols-[20%_80%] w-full">
                <div className="col-start-1 row-span-full">
                    <Tile className='bg-white'>
                        {calendarName}
                    </Tile>
                </div>
            </div>
        </div>
    )
}

/*
function CalendarOwner({
    metadata,
    maindata,
    meetme,
    memberlist,
    timeline,
    timeblocks,
    meeting_time,
    timeline_setstate,
    org_memberlist = null,
}) {
    const [display_invite_dialogue, set_invite_dialogue] = useState(false);
    const mainbody_id = uniqid();

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

    const collaborator_id = uniqid();
    const [pendingMemberList, setPendingMemberList] = useState([]);
    const pendingMemberList_ref = useRef();
    pendingMemberList_ref.current = pendingMemberList;

    function add_collaborators() {
        const netid_to_add = document.getElementById(collaborator_id).value;
        if (!pendingMemberList.some((member) => member.netid == netid_to_add))
            setPendingMemberList([
                ...pendingMemberList,
                { netid: netid_to_add, is_valid: null },
            ]);
        else return;

        fetch(process.env.API_URL + '/user/' + netid_to_add, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                const new_pending_member_arr = [...pendingMemberList_ref.current];
                new_pending_member_arr.forEach((member, idx) => {
                    console.log(member);
                    if (member.netid === netid_to_add) {
                        new_pending_member_arr[idx].is_valid = data.Status === 'ok';
                        setPendingMemberList(new_pending_member_arr);
                    }
                });
            });
    }

    function removeAccess(netid) {
        console.log(netid);
        fetch(`${process.env.API_URL}/cal/${metadata._id}/share`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ target_users: [netid] }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            });
    }

    function removeCollaborator(netid) {
        const new_arr = [...pendingMemberList];
        for (let i = 0; i < new_arr.length; i++) {
            if (new_arr[i].netid === netid) new_arr.splice(i, 1);
        }
        setPendingMemberList(new_arr);
    }
    const [finalMeetingTime, setFinalMeetingTime] = useState({
        start: new Date(meeting_time.start).toString(),
        end: new Date(meeting_time.end).toString(),
    });

    function renderMeetingTimeTile() {
        return (
            <div>
                {finalMeetingTime != null ? (
                    <>
                        <p>Start: {finalMeetingTime.start}</p>
                        <p>End: {finalMeetingTime.end}</p>
                    </>
                ) : (
                    <p className="text-gray-600/80 text-sm">
            No meeting time has been set
                    </p>
                )}
            </div>
        );
    }

    const [finalLocation, setFinalLocation] = useState(metadata.location);
    function renderLocationTile() {
        return (
            <div>
                {finalLocation !== null ? (
                    finalLocation
                ) : (
                    <p className="text-gray-600/80 text-sm">No location has been set</p>
                )}
            </div>
        );
    }

    const [dialogue_menu, set_dialogue_menu] = useState('default');
    const [invite_response, set_invite_response] = useState({});
    const [showInviteDialogue, setShowInviteDialogue] = useState(false);
    function invite_dialogue() {
        let body = null;
        switch (dialogue_menu) {
        case 'default':
            body = (
                <div>
                    <div
                        style={{
                            display: pendingMemberList.length == 0 ? 'none' : 'flex',
                        }}
                        className={`flex flex-wrap gap-x-1 rounded border border-solid border-black p-2`}
                    >
                        {pendingMemberList.map((member) => {
                            const netid = member.netid;
                            const item_status_id = uniqid();
                            const netid_target = uniqid();

                            return (
                                <div
                                    key={uniqid()}
                                    className="leading-5 py-1 px-1 border-2 text-slate-500 rounded-full shadow-sm flex"
                                >
                                    {(() => {
                                        if (member.is_valid === null)
                                            return (
                                                <div id={item_status_id} className="animate-spin">
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
                                                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                                        />
                                                    </svg>
                                                </div>
                                            );
                                        if (member.is_valid === false)
                                            return (
                                                <svg
                                                    id={item_status_id + '_error'}
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
                                                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                                    />
                                                </svg>
                                            );
                                        return (
                                            <svg
                                                id={item_status_id + '_ok'}
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
                                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        );
                                    })()}
                                    <span style={{ width: '5px' }}></span>
                                    <div className="inline flex items-center">
                                        <div id={netid_target}>{netid}</div>
                                    </div>
                                    <span style={{ width: '15px' }}></span>
                                    <button
                                        onClick={() => {
                                            removeCollaborator(netid);
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
                                </div>
                            );
                        })}
                        <div
                            className="leading-5 py-1 px-1 border-2 text-slate-500 rounded-full shadow-sm flex"
                            style={{ opacity: 0 }}
                        >
                            <span className="material-icons rounded-full md-18 inline items-center">
                  pending
                            </span>
                            <div className="inline flex items-center">somerandomnetid</div>
                            <span style={{ width: '15px' }}></span>
                        </div>
                    </div>
                    {pendingMemberList.length === 0 ? (
                        <p className="mt-3 font-semibold">People with access</p>
                    ) : (
                        <></>
                    )}
                    <ul>
                        {pendingMemberList.length === 0 ? (
                            memberlist.map((member) => {
                                return (
                                    <li
                                        key={uniqid()}
                                        className="mt-2 p-1 flex w-full justify-center items-center hover:bg-gray-200"
                                    >
                                        <div className="flex justify-between grow">
                                            <div className="w-fit">
                                                {member._id}
                                                {member._id === getUser().attributes.uid
                                                    ? '(you)'
                                                    : ''}
                                            </div>
                                            <div className="flex items-center w-fit text-gray-700/70 capitalize">
                                                {member.type}
                                                {member._id === getUser().attributes.uid ? (
                                                    <DropdownMenu
                                                        menuItems={['Owner', 'Editor', 'Viewer']}
                                                        menuItemFunctions={[() => {}, () => {}, () => {}]}
                                                    />
                                                ) : (
                                                    <DropdownMenu
                                                        menuItems={[
                                                            'Owner',
                                                            'Editor',
                                                            'Viewer',
                                                            'Remove Access',
                                                        ]}
                                                        menuItemFunctions={[
                                                            () => {},
                                                            () => {},
                                                            () => {},
                                                            () => {
                                                                removeAccess(member._id);
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <></>
                        )}
                    </ul>
                    <div className="w-full flex justify-center">
                        {(() => {
                            if (pendingMemberList.length !== 0) {
                                return (
                                    <Button
                                        text="Send"
                                        red
                                        rounded="rounded-full"
                                        paddingX={3}
                                        click_passthrough={() => {
                                            set_dialogue_menu('loading');
                                            const only_netids_of_pendingMemberList = [];
                                            pendingMemberList.forEach((member) => {
                                                only_netids_of_pendingMemberList.push(member.netid);
                                            });
                                            fetch(
                                                process.env.API_URL +
                            '/cal/' +
                            metadata._id +
                            '/share',
                                                {
                                                    method: 'PATCH',
                                                    credentials: 'include',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        new_users: only_netids_of_pendingMemberList,
                                                    }),
                                                }
                                            )
                                                .then((res) => res.json())
                                                .then((data) => {
                                                    set_invite_response(data);
                                                    set_dialogue_menu('finished');
                                                });
                                        }}
                                    />
                                );
                            }
                        })()}
                    </div>

                    <div className="flex items-start items-center justify-center mt-3 space-x-4">
                        <TextField
                            label="standard"
                            variant="standard"
                            placeholder={'netid'}
                            fullWidth
                            id={collaborator_id}
                            enter_shortcut={() => {
                                add_collaborators();
                            }}
                        />
                        {(() => {
                            return (
                                <>
                                    <Button
                                        text="Add"
                                        click_passthrough={add_collaborators}
                                    ></Button>
                                    <Button
                                        text="Done"
                                        red={true}
                                        click_passthrough={() => {
                                            setPendingMemberList([]);
                                            // set_invite_dialogue(false);
                                            setShowInviteDialogue(false);
                                        }}
                                    />
                                </>
                            );
                        })()}
                    </div>
                </div>
            );
            break;
        case 'loading':
            body = (
                <span className="animate-spin material-symbols-outlined md-48">
            autorenew
                </span>
            );
            break;
        case 'finished':
            body = (
                <div className="justify-center w-3/4 px-8 py-5 mx-2 my-2 bg-white rounded-md shadow-sm ">
                    <button
                        onClick={() => {
                            set_invite_dialogue(false);
                            setShowInviteDialogue(false);
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
            <HeadlessDialogue
                isOpen={showInviteDialogue}
                setIsOpen={setShowInviteDialogue}
            >
                {body}
            </HeadlessDialogue>
        );
    }

    const [display_location_dialogue, set_display_location_dialogue] =
    useState(false);
    const location_dialogue_id = uniqid();
    function closelocationModal() {
        set_display_location_dialogue(false);
    }

    function openlocationModal() {
        console.log('asfdsf');
        set_display_location_dialogue(true);
    }

    function location_dialogue() {
        return (
            <HeadlessDialogue
                setIsOpen={set_display_location_dialogue}
                isOpen={display_location_dialogue}
            >
                <TextField placeholder={'Location'} id={location_dialogue_id} />
                <div className="w-full flex justify-center">
                    <button
                        className="bg-rose-500 px-3 py-2 my-2 rounded text-white hover:bg-rose-600 transition-all duration-150"
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
                                    setFinalLocation(data.location);
                                    set_display_location_dialogue(false);
                                });
                        }}
                    >
            set location
                    </button>
                </div>
            </HeadlessDialogue>
        );
    }

    const [display_final_meeting_dialogue, set_display_final_meeting_dialogue] =
    useState(false);
    const [ok_to_set_time, set_ok_to_set_time] = useState(true);
    const [showFinalMeetingDialogue, setShowFinalMeetingDialogue] =
    useState(false);
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
            <HeadlessDialogue
                isOpen={showFinalMeetingDialogue}
                setIsOpen={setShowFinalMeetingDialogue}
            >
                <div
                    // className="justify-center sm:w-3/4 md:w-2/3 lg:w-1/3 px-4 py-5 mx-2 my-2 bg-white rounded-md shadow-sm"
                >
                    <div className="flex">
                        <div className="w-1/2 text-center">
                            <div className="text-gray-600">Start</div>
                            <input
                                id={start}
                                type="time"
                                defaultValue={meeting_time.start}
                                step="900"
                            />
                            <input id={start_date} type="date" />
                        </div>
                        <div class="w-1/2 text-center">
                            <div className="text-gray-600">End</div>
                            <input
                                id={end}
                                type="time"
                                defaultValue={meeting_time.end}
                                step="900"
                            />
                            <input id={end_date} type="date" />
                        </div>
                    </div>
                    <div>{!ok_to_set_time ? <p>{ok_to_set_time}</p> : <></>}</div>
                    <div className="w-full flex justify-center">
                        <button
                            className="bg-rose-500 px-3 py-2 rounded text-white hover:bg-rose-600 transition-all duration-150"
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
                                        console.log(data);
                                        setFinalMeetingTime({
                                            start: new Date(data.time.start).toString(),
                                            end: new Date(data.time.end).toString(),
                                        });

                                        set_ok_to_set_time('good');
                                        setShowFinalMeetingDialogue(false);
                                    });
                            }}
                        >
              save
                        </button>
                    </div>
                </div>
            </HeadlessDialogue>
        );
    }

    function renderMeetingCollaboratorsTile() {
        if (org_memberlist === null)
            return (
                <>
                    <p className="font-bold text-xs text-slate-400/70">OWNER</p>
                    {renderCollabatorsList(['owner'], memberlist)}
                    <p className="font-bold text-xs text-slate-400/70">MEMBERS</p>
                    {renderCollabatorsList(['member', 'user'], memberlist)}
                    <p className="font-bold text-xs text-slate-400/70">VIEWERS</p>
                    {renderCollabatorsList(['member', 'viewer'], memberlist)}
                </>
            );

        return (
            <>
                <p className="font-bold text-xs text-slate-400/70">OWNER</p>
                <div className="flex items-center">
                    <img
                        src="https://oss.rutgers.edu/images/jona.jpeg"
                        className="rounded-full w-8 h-8 inline"
                    />
                    <div className="inline-block">
                        <div>name</div>
                        <div
                            className="text-gray-500 text-xs"
                            style={{ position: 'relative', top: '-5px' }}
                        >
                            {org_memberlist.owner}
                        </div>
                    </div>
                </div>
                <p className="font-bold text-xs text-slate-400/70">ADMINS</p>
                <ul>
                    {org_memberlist.admins.map((netid) => {
                        return (
                            <li key={uniqid()} className="flex items-center">
                                <img
                                    src="https://oss.rutgers.edu/images/Josh.jpg"
                                    className="rounded-full w-8 h-8 inline"
                                />
                                <div className="inline-block">
                                    <div>name</div>
                                    <div
                                        className="text-gray-500 text-xs"
                                        style={{ position: 'relative', top: '-5px' }}
                                    >
                                        {netid}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </>
        );
    }

    return (
        <>
            <div
                className="flex flex-col items-center w-full h-full bg-gray-100 border-gray-100 grow"
                id={mainbody_id}
            >
                <div className="grid grid-cols-[20%_80%] w-full">
                    <div className="col-start-1 row-span-full">
                        <Tile title="Name">{metadata.name}</Tile>
                        <Tile
                            title="Collaborators"
                            buttonTitle={
                                <button
                                    className="flex items-center w-fit h-fit p-2 bg-rose-600 transition-all duration-150 hover:bg-rose-900 hover:cursor-pointer text-white rounded-full"
                                    onClick={() => {
                                        set_invite_dialogue(true);
                                        setShowInviteDialogue(true);
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
                                            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                                        />
                                    </svg>
                                    <div className="h-fit w-fit mx-1">+</div>
                                </button>
                            }
                        >
                            {renderMeetingCollaboratorsTile()}
                        </Tile>
                        <Tile
                            title="Final Meeting"
                            className="col-start-1"
                            buttonTitle={
                                <div
                                    onClick={() => {
                                        setShowFinalMeetingDialogue(true);
                                        set_display_final_meeting_dialogue(true);
                                    }}
                                    className="flex items-center w-fit h-fit p-2 bg-rose-600 transition-all duration-150 hover:bg-rose-900 hover:cursor-pointer text-white rounded-full"
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
                                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <div className="h-fit w-fit mx-1">+</div>
                                </div>
                            }
                        >
                            {renderMeetingTimeTile()}
                        </Tile>
                        <Tile
                            title="Location"
                            buttonTitle={
                                <div
                                    onClick={() => {
                                        openlocationModal();
                                    }}
                                    className="flex items-center w-fit h-fit p-2 bg-rose-600 transition-all duration-150 hover:bg-rose-900 hover:cursor-pointer text-white rounded-full"
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
                                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                        />
                                    </svg>
                                    <div className="h-fit w-fit mx-1">+</div>
                                </div>
                            }
                        >
                            <div>{renderLocationTile()}</div>
                        </Tile>
                    </div>

                    <div className="col-start-2 row-span-full">
                        <CalendarTabs
                            GlobalCalendar={
                                <Tile overflowX>
                                    <GlobalCalendar
                                        meetme_input={meetme}
                                        memberlist_input={memberlist}
                                    />
                                </Tile>
                            }
                            UserCalendar={
                                <Tile overflowX>
                                    <UserCalendar
                                        meetme_input={meetme}
                                        timeline_input={timeline}
                                        timeblocks_input={timeblocks}
                                        cal_id={metadata._id}
                                        timeline_setstate={timeline_setstate}
                                    />
                                </Tile>
                            }
                        />
                    </div>
                </div>
                {display_invite_dialogue ? invite_dialogue() : <></>}
                {display_location_dialogue ? location_dialogue() : <></>}
                {display_final_meeting_dialogue ? final_meeting_dialogue() : <></>}
            </div>
        </>
    );
}
*/

export default CalendarOwner;
