import { useState, useEffect, useRef } from 'react';
import uniqid from 'uniqid';
import socket from '../socket';

function MyMeetings() {
    const [userInfo, setUserInfo] = useState(null);
    const [calendarInfo, setCalendarInfo] = useState(null);
    const [pending_calInfo, setPending_calInfo] = useState(null);
    const stateRef = useRef();
    stateRef.current = calendarInfo;

    useEffect(() => {
        setup_sockets();
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
                getPendingCalendarData(data);
            });
    }, []);

    function getCalendarMetadata(data) {
        let cal_urls = [];
        for (let i = 0; i < data.data.calendars.length; i++) {
            cal_urls.push(
                process.env.API_URL + '/cal/' + data.data.calendars[i]._id + '/meta'
            );
        }
        fetchAndSetData(cal_urls, data.data.calendars, setCalendarInfo, 'metadata');
    }
    function getPendingCalendarData(data) {
        let pending_cal_urls = [];
        for (let i = 0; i < data.data.pendingCalendars.length; i++) {
            pending_cal_urls.push(
                process.env.API_URL +
          '/cal/' +
          data.data.pendingCalendars[i]._id +
          '/meta'
            );
        }
        fetchAndSetData(
            pending_cal_urls,
            data.data.pendingCalendars,
            setPending_calInfo,
            'metadata'
        );
    }
    function fetchAndSetData(urls, data, setState, response_key) {
        const arr = new Array(data.length);
        if (data.length === 0) setState([]);
        let fetchCounter = data.length;
        for (let i = 0; i < data.length; i++) {
            fetch(urls[i], {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((res_data) => {
                    if (res_data.Status === 'ok') arr[i] = res_data[response_key];

                    --fetchCounter;
                    if (fetchCounter == 0) {
                        setState(arr);
                    }
                });
        }
    }
    function updateCalendarMetaData(cal_id) {
        let url = process.env.API_URL + '/cal/' + cal_id + '/meta';
        console.log('Calendar info: ' + stateRef.current);
        let currentMetaData = [...stateRef.current];
        for (let i = 0; i < currentMetaData.length; i++) {
            if (currentMetaData[i]._id === cal_id) {
                fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        currentMetaData[i] = data.metadata;
                        setCalendarInfo(currentMetaData);
                        // console.log(currentMetaData);
                    });
                break;
            }
        }
    }

    const setup_sockets = () => {
    //https://api.localhost.edu/sauron/?EIO=4&transport=polling
        socket.on('connect_error', (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
        socket.on('connect', () => {
            socket.emit('dashboard');
        });
        socket.on('custom-message', (msg, obj) => {});

        socket.on('calendar_metadata_updated', (cal_id) => {
            updateCalendarMetaData(cal_id);
            // getCalendarMetadata();
            console.log(cal_id);
        });
    };

    if (userInfo === null || calendarInfo === null || pending_calInfo === null) {
        return (
            <div>
                <p>Loading data... please wait</p>
            </div>
        );
    }

    return (
        <div className="bg-neutral-100 flex flex-col items-center px-10">
            <div className="container mt-4 mb-4 flex justify-center">
                <p className="text-3xl font-bold">My Meetings</p>
            </div>
            <div className="container p-3 w-10/12 grid gap-6 grid-cols-2 lg:grid-cols-3">
                {calendarInfo.map((cal) => (
                    <div
                        class="flex justify-center mr-3.5 mb-3 w-full h-full"
                        key={uniqid()}
                    >
                        <div className="rounded w-full p-7 bg-white">
                            {/* <p>{JSON.stringify(cal)}</p> */}
                            <p className="text-xl font-semibold w-full break-words">
                                {cal.name}
                            </p>
                            <p className="text-sm font-medium text-slate-500/50 w-full break-words">
                                {cal.owner._id}
                            </p>
                            <p className="w-full break-words">{cal.location}</p>
                            {/* <p className='w-full'>{cal._id}</p> */}
                        </div>
                    </div>
                ))}
            </div>
            {calendarInfo.length == 0 ? (
                <p className="w-full text-center text-2xl text-gray-700/50 mb-7">
          No Meetings Created Yet
                </p>
            ) : (
                ''
            )}
            <div className="container my-4 flex justify-center">
                <p className="text-3xl font-bold">Pending Meeting Invitations</p>
            </div>
            <div className="container p-3 w-10/12 grid gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                {pending_calInfo.map((pendingCal) => (
                    <div
                        class="flex justify-center mr-3.5 mb-3 w-full h-full"
                        key={uniqid()}
                    >
                        <div className="rounded w-full p-7 bg-white">
                            <p className="text-xl font-semibold w-full break-words">
                                {pendingCal.name}
                            </p>
                            <p className="text-sm font-medium text-slate-500/50 w-full break-words">
                                {pendingCal.owner._id}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {pending_calInfo.length == 0 ? (
                <p className="w-full text-center text-2xl text-gray-700/50 mb-7">
          No pending meeting invitations
                </p>
            ) : (
                ''
            )}
        </div>
    );
}

export default MyMeetings;
