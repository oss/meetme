import { useState, useEffect, useRef } from 'react';
import uniqid from 'uniqid';
import { socket } from '../socket';
import Tile from '../components/utils/tile';
import { PopupDialogue } from '../components/utils/popup-dialogue';
import { Link, useNavigate } from 'react-router-dom';
import TextField from '../components/utils/text-field';
import Button from '../components/utils/button';
import { getUser } from '../utils';
import DropdownMenu from '../components/utils/dropdown-menu';
import HeadlessDialogue from '../components/utils/headless-dialogue';
import { CalendarAPI } from '../api/calendar-api';
import { OrganizationAPI } from '../api/organization-api';
import { MaterialTailwindTheme } from '@material-tailwind/react';

function Dashboard() {
    const [userInfo, setUserInfo] = useState(null);
    const [calendarInfo, setCalendarInfo] = useState(null);
    const [orgInfo, setOrgInfo] = useState(null);
    const [show_cal_dialogue, set_cal_dialogue] = useState(false);

    const stateRef = useRef();
    stateRef.current = calendarInfo;

    useEffect(() => {
        fetch(process.env.API_URL + '/user/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setUserInfo(data);
                getCalendarMetadata(data);
                getOrganizationData(data);
            });
    }, []);

    useEffect(() => {
        socket.on('connect_error', (err) => {});

        socket.emit('dashboard');

        socket.on('custom-message', (msg, obj) => {});

        socket.on('calendar_metadata_updated', (cal_id) => {
            updateCalendarMetaData(cal_id);
        });

        socket.on('org_invite', (org_id) => {});

        return () => {
            socket.offAny('connect_error');
            socket.offAny('custom-message');
            socket.offAny('calendar_metadata_updated');
            socket.offAny('org_update');
            socket.offAny('org_invite');
        };
    }, []);

    async function getCalendarMetadata(data) {
        let calendarIDs = data.data.calendars.map((cal) => cal._id);
        let res = await CalendarAPI.getAllMetadata(calendarIDs);
        setCalendarInfo(res.map((calendar) => calendar.metadata));
    }
    async function getOrganizationData(data) {
        let orgIDs = data.data.organizations.map((org) => org._id);
        let res = await OrganizationAPI.getAllData(orgIDs);
        setOrgInfo(res.map((org) => org.organization));
    }

    async function updateCalendarMetaData(calendarID) {
        let data = await CalendarAPI.getMetadata(calendarID).metadata;
        let currentMetaData = [...stateRef.current];

        for (let i = 0; i < currentMetaData.length; i++) {
            if (currentMetaData[i]._id === calendarID) {
                currentMetaData[i] = data.metadata;
                setCalendarInfo(currentMetaData);
                break;
            }
        }
    }

    const [ctx_id, do_not_set_ctx_id] = useState(uniqid());
    const [cal_dialogue_div_id, do_not_set_cal_dialogue_div_id] = useState(
        uniqid()
    );

    async function changeName(cal_id, newName) {
        let data = await CalendarAPI.renameCalendar(cal_id, newName);
        if (data.Status === 'ok') {
            set_cal_dialogue(false);
            const new_arr = [...calendarInfo];
            for (let i = 0; i < new_arr.length; i++) {
                if (new_arr[i]._id === cal_id) new_arr[i].name = newName;
            }
            setCalendarInfo(new_arr);
        } else set_cal_dialogue({ field: 'error', error: data.error });
    }

    async function delete_cal(calendarID) {
        let data = await CalendarAPI.deleteCalendar(calendarID);
        if (data.Status === 'ok') {
            set_cal_dialogue(false);
            setCalendarInfo(
                calendarInfo.filter((cal) => cal._id !== calendarID)
            );
        } else set_cal_dialogue({ field: 'error', error: data.error });
    }

    async function leave_cal(calendarID) {
        let data = await CalendarAPI.leaveCalendar(calendarID);

        if (data.Status === 'ok') {
            set_cal_dialogue(false);
            const new_arr = [];
            for (let i = 0; i < calendarInfo.length; i++) {
                if (calendarInfo[i]._id !== calendarID)
                    new_arr.push(calendarInfo[i]);
            }
            setCalendarInfo(new_arr);
        } else set_cal_dialogue({ field: 'error', error: data.error });
    }
    let [showCalendarDialogue, setShowCalendarDialogue] = useState(false);
    function renderCalendarDialogue() {
        const cal_id_index = document.getElementById(ctx_id);
        const cal_data = calendarInfo[show_cal_dialogue.index];

        switch (show_cal_dialogue.field) {
            case 'name':
                const textfield_id = uniqid();
                return (
                    <HeadlessDialogue
                        isOpen={showCalendarDialogue}
                        setIsOpen={setShowCalendarDialogue}
                    >
                        <div className="inline-flex w-full">
                            <div className="flex items-center justify-center w-full mt-3 space-x-4">
                                <TextField
                                    id={textfield_id}
                                    defaultValue={
                                        calendarInfo[show_cal_dialogue.index]
                                            .name
                                    }
                                    enter_shortcut={() => {
                                        const dupe = { ...show_cal_dialogue };
                                        dupe.field = 'loading';
                                        set_cal_dialogue(dupe);
                                        changeName(
                                            cal_data._id,
                                            document.getElementById(
                                                textfield_id
                                            ).value
                                        );
                                    }}
                                />
                                <Button
                                    text="Change name"
                                    red
                                    click_passthrough={() => {
                                        const dupe = { ...show_cal_dialogue };
                                        dupe.field = 'loading';
                                        set_cal_dialogue(dupe);
                                        changeName(
                                            cal_data._id,
                                            document.getElementById(
                                                textfield_id
                                            ).value
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </HeadlessDialogue>
                );

            case 'delete':
                return (
                    <HeadlessDialogue
                        isOpen={showCalendarDialogue}
                        setIsOpen={setShowCalendarDialogue}
                    >
                        <p className="text-lg text-center">Are You Sure?</p>
                        <div className="flex justify-evenly">
                            <Button
                                red={true}
                                click_passthrough={() => {
                                    const dupe = { ...show_cal_dialogue };
                                    dupe.field = 'loading';
                                    set_cal_dialogue(dupe);
                                    delete_cal(cal_data._id);
                                }}
                                text="Delete"
                            />
                            <Button
                                click_passthrough={() => {
                                    setShowCalendarDialogue(false);
                                    // set_cal_dialogue(false);
                                }}
                                text="No"
                            />
                        </div>
                    </HeadlessDialogue>
                );
            case 'leave':
                return (
                    <HeadlessDialogue
                        isOpen={showCalendarDialogue}
                        setIsOpen={setShowCalendarDialogue}
                    >
                        <Button
                            text="Leave"
                            red
                            click_passthrough={() => {
                                const dupe = { ...show_cal_dialogue };
                                dupe.field = 'loading';
                                set_cal_dialogue(dupe);
                                leave_cal(cal_data._id);
                            }}
                        />
                    </HeadlessDialogue>
                );
            case 'loading':
                return (
                    <PopupDialogue
                        onClose={() => {
                            set_cal_dialogue(false);
                        }}
                    >
                        <span className="animate-spin material-symbols-outlined md-48">
                            autorenew
                        </span>
                    </PopupDialogue>
                );
            case 'error':
                return (
                    <PopupDialogue
                        onClose={() => {
                            set_cal_dialogue(false);
                        }}
                    >
                        <p>{show_cal_dialogue.error}</p>
                    </PopupDialogue>
                );
            case 'ok':
                return (
                    <PopupDialogue
                        onClose={() => {
                            set_cal_dialogue(false);
                        }}
                    ></PopupDialogue>
                );
            default:
                return (
                    <PopupDialogue
                        onClose={() => {
                            set_cal_dialogue(false);
                        }}
                    >
                        Something abnormal happened.
                    </PopupDialogue>
                );
        }
    }

    if (userInfo === null || calendarInfo === null || orgInfo === null) {
        return (
            <div>
                <p>Loading data... please wait</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center h-full px-10 bg-neutral-100">
            <div className="container flex justify-center mt-4 mb-4">
                <p className="text-3xl font-semibold transition-all duration-150 ease-linear">
                    Meetings
                </p>
            </div>
            <ul className="inline-flex flex-wrap w-full gap-y-3">
                {calendarInfo.map((cal, idx) => (
                    <>
                        <li
                            className="flex-1 basis-72"
                            key={uniqid()}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                const ctx_menu =
                                    document.getElementById(ctx_id);
                                if (
                                    calendarInfo[idx].owner._id == getUser().uid
                                )
                                    ctx_menu.childNodes[0].childNodes[1].childNodes[0].textContent =
                                        'Delete';
                                else
                                    ctx_menu.childNodes[0].childNodes[1].childNodes[0].textContent =
                                        'Leave';

                                ctx_menu.cal_target = cal._id;
                                ctx_menu.style.left = e.pageX - 10 + 'px';
                                ctx_menu.style.top = e.pageY - 10 + 'px';
                                ctx_menu.style.display = 'block';
                                ctx_menu.cal_arr_idx = idx;
                            }}
                        >
                            <div style={{ display: 'grid' }} className="group">
                                <div style={{ gridColumn: 1, gridRow: 1 }}>
                                    <div className="invisible w-full h-full transition-all group-hover:visible">
                                        <Tile
                                            className={''}
                                            bg_color={'bg-rose-600'}
                                            default_margin={true}
                                            fullHeight={true}
                                        ></Tile>
                                    </div>
                                </div>
                                <div
                                    className="transition ease-in-out group-hover:translate-x-3"
                                    style={{ gridColumn: 1, gridRow: 1 }}
                                >
                                    <div className="w-full h-full">
                                        <Link to={'/cal/' + cal._id}>
                                            <Tile
                                                extracss={
                                                    'border border-2 border-solid border-white box-border'
                                                }
                                                default_margin={true}
                                                fullHeight={true}
                                            >
                                                <div className="flex">
                                                    <div
                                                        className="flex justify-center w-full h-full"
                                                        key={uniqid()}
                                                    >
                                                        <div className="w-full p-4 bg-white rounded cursor-pointer">
                                                            {/* <p>{JSON.stringify(cal)}</p> */}
                                                            <p className="w-full text-xl font-semibold break-words">
                                                                {cal.name}
                                                            </p>
                                                            <p className="w-full text-sm font-medium break-words text-slate-500/50">
                                                                {cal.owner._id}
                                                            </p>
                                                            <p
                                                                className={
                                                                    'w-full break-words ' +
                                                                    (cal.location ==
                                                                    null
                                                                        ? 'text-gray-300'
                                                                        : 'text-slate-500/50 font-semibold')
                                                                }
                                                            >
                                                                {cal.location ==
                                                                null
                                                                    ? '-'
                                                                    : cal.location}
                                                            </p>
                                                            {/* <p className='w-full'>{cal._id}</p> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tile>
                                        </Link>
                                    </div>
                                </div>
                                <div
                                    style={{ gridColumn: 1, gridRow: 1 }}
                                    className="justify-self-end transition ease-in-out group-hover:translate-x-3"
                                >
                                    <div
                                        className="w-7 relative"
                                        style={{ left: '-20px', top: '20px' }}
                                    >
                                        {getUser().uid == cal.owner._id ? (
                                            <DropdownMenu
                                                menuItems={['Rename', 'Delete']}
                                                menuItemFunctions={[
                                                    () => {
                                                        set_cal_dialogue({
                                                            index: idx,
                                                            field: 'name',
                                                        });
                                                        setShowCalendarDialogue(
                                                            true
                                                        );
                                                    },
                                                    () => {
                                                        set_cal_dialogue({
                                                            index: idx,
                                                            field: 'delete',
                                                        });
                                                        setShowCalendarDialogue(
                                                            true
                                                        );
                                                    },
                                                ]}
                                            />
                                        ) : (
                                            <DropdownMenu
                                                menuItems={['Rename', 'Leave']}
                                                menuItemFunctions={[
                                                    () => {
                                                        set_cal_dialogue({
                                                            index: idx,
                                                            field: 'name',
                                                        });
                                                        setShowCalendarDialogue(
                                                            true
                                                        );
                                                    },
                                                    () => {
                                                        set_cal_dialogue({
                                                            index: idx,
                                                            field: 'leave',
                                                        });
                                                        setShowCalendarDialogue(
                                                            true
                                                        );
                                                    },
                                                ]}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* transition-[border] duration-100 ease-linear hover:border-l-8 border-rose-600 */}
                        </li>
                    </>
                ))}
                {calendarInfo.map((cal, idx) => (
                    <li className="grow basis-72"></li>
                ))}
                <div
                    id={ctx_id}
                    cal_arr_idx={-1}
                    style={{
                        display: 'none',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    }}
                    className="px-3 py-1 m-3 bg-gray-100 border-solid rounded-lg border-slate-800 text-slate-600"
                    onPointerLeave={() => {
                        if (
                            !document
                                .getElementById(cal_dialogue_div_id)
                                .hasChildNodes()
                        )
                            document.getElementById(ctx_id).style.display =
                                'none';
                    }}
                >
                    <ul>
                        <li>
                            <button
                                className="hover:text-slate-900"
                                onClick={() => {
                                    document.getElementById(
                                        ctx_id
                                    ).style.display = 'none';
                                    set_cal_dialogue({
                                        index: document.getElementById(ctx_id)
                                            .cal_arr_idx,
                                        field: 'name',
                                    });
                                }}
                            >
                                Rename
                            </button>
                        </li>
                        <li>
                            <button
                                className="hover:text-slate-900"
                                onClick={(e) => {
                                    console.log('click');
                                    document.getElementById(
                                        ctx_id
                                    ).style.display = 'none';
                                    if (
                                        calendarInfo[
                                            document.getElementById(ctx_id)
                                                .cal_arr_idx
                                        ].owner._id == getUser().uid
                                    )
                                        set_cal_dialogue({
                                            index: document.getElementById(
                                                ctx_id
                                            ).cal_arr_idx,
                                            field: 'delete',
                                        });
                                    else
                                        set_cal_dialogue({
                                            index: document.getElementById(
                                                ctx_id
                                            ).cal_arr_idx,
                                            field: 'leave',
                                        });
                                }}
                            >
                                delete or leave not set
                            </button>
                        </li>
                    </ul>
                </div>
                <div id={cal_dialogue_div_id}>
                    {show_cal_dialogue ? renderCalendarDialogue() : <></>}
                </div>
            </ul>
            {calendarInfo.length == 0 ? (
                <p className="w-full text-2xl text-center text-gray-700/50 mb-7">
                    No Meetings Created Yet
                </p>
            ) : (
                ''
            )}
            <span className="h-4"></span>
            <div className="container flex justify-center mb-4">
                <p className="text-3xl font-semibold transition-all duration-150 ease-linear">
                    Organizations
                </p>
            </div>
            <ul className="inline-flex flex-wrap w-full gap-y-3">
                {/* replace sampleData with orgInfo  for actual data*/}
                {orgInfo.map((org, idx) => (
                    <>
                        <li className="flex-1 basis-72" key={uniqid()}>
                            {/* transition-[border] duration-100 ease-linear hover:border-l-8 border-rose-600 */}
                            <Link
                                to={'/org/' + org._id}
                                style={{ textDecoration: 'none' }}
                            >
                                <div
                                    style={{ display: 'grid' }}
                                    className="group"
                                >
                                    <div style={{ gridColumn: 1, gridRow: 1 }}>
                                        <div className="invisible w-full h-full transition-all group-hover:visible">
                                            <Tile
                                                className={''}
                                                bg_color={'bg-rose-600'}
                                                default_margin={true}
                                                fullHeight={true}
                                            ></Tile>
                                        </div>
                                    </div>
                                    <div
                                        className="transition ease-in-out group-hover:translate-x-3"
                                        style={{ gridColumn: 1, gridRow: 1 }}
                                    >
                                        <div className="w-full h-full">
                                            <Tile
                                                extracss={
                                                    'border border-2 border-solid border-white box-border'
                                                }
                                                default_margin={true}
                                                fullHeight={true}
                                            >
                                                <div
                                                    className="flex justify-center w-full h-full"
                                                    key={uniqid()}
                                                >
                                                    <div className="w-full p-4 bg-white rounded">
                                                        {/* <p>{JSON.stringify(cal)}</p> */}
                                                        <p className="w-full text-xl font-semibold break-words">
                                                            {org.name}
                                                        </p>
                                                        <p className="w-full text-sm font-medium break-words text-slate-500/50">
                                                            {org.owner._id}
                                                        </p>
                                                        <p className="w-full break-words">
                                                            {org.location}
                                                        </p>
                                                        {/* <p className='w-full'>{cal._id}</p> */}
                                                    </div>
                                                </div>
                                            </Tile>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    </>
                ))}
                {orgInfo.map((org, idx) => (
                    <li className="grow basis-72"></li>
                ))}
            </ul>
            {orgInfo.length == 0 ? (
                <p className="w-full text-2xl text-center text-gray-700/50 mb-7">
                    No Organizations Created Yet
                </p>
            ) : (
                ''
            )}
            <span className="h-4"></span>
        </div>
    );
}

export default Dashboard;
