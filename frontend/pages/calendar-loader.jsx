import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUser } from '../utils';
import CalendarOwner from './calendar/calendar-owner';
import CalendarUser from './calendar/calendar-user';
import CalendarViewer from './calendar/calendar-viewer';
import CalendarEditor from './calendar/calendar-editor';
import { socket } from '../socket';
import Cookies from 'js-cookie';

function CalendarLoader() {
    const { id } = useParams();
    const [cal_metadata, set_cal_metadata] = useState(null);
    const [cal_maindata, set_cal_maindata] = useState(null);
    const [timeblocks, set_timeblocks] = useState(null);
    const [timeline, set_timeline] = useState(null);
    const [meetme, set_meetme] = useState(null);
    const [meetme_passthrough, set_meetme_passthrough] = useState(null);
    const [memberlist, set_memberlist] = useState(null);
    const [meet_time, set_meet_time] = useState(null);
    const [display, set_display] = useState({ ok: false, msg: 'loading' });
    const [userdata, this_will_never_be_set_so_dont_touch_it_thanks] = useState(
        () => {
            return JSON.parse(atob(Cookies.get('session'))).passport.user;
        }
    );
    const [org_memberlist, set_org_memberlist] = useState(null);
    useEffect(() => {
        set_display_status();
    }, [
        cal_metadata,
        cal_maindata,
        timeblocks,
        timeline,
        meetme,
        memberlist,
        meet_time,
    ]);

    useEffect(() => {
        get_metadata();
        get_maindata();
        get_timeblocks();
        get_timeline();
        get_meetme();
        get_memberlist();
        get_meet_time();
        return setup_sockets();
    }, []);

    function get_metadata() {
        fetch(process.env.API_URL + '/cal/' + id + '/meta', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === 'ok') {
                    set_cal_metadata(data);
                    if (data.metadata.owner.owner_type === 'organization')
                        get_org_memberlist(data.metadata.owner._id);
                } else set_display({ ok: false, msg: data.error });
                set_display_status();
            });
    }
    function get_maindata() {
        fetch(process.env.API_URL + '/cal/' + id + '/main', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === 'ok') set_cal_maindata(data);
                else set_display({ ok: false, msg: data.error });
                set_display_status();
            });
    }
    function get_timeblocks() {
        fetch(process.env.API_URL + '/cal/' + id + '/timeblocks', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === 'ok') set_timeblocks(data);
                else set_display({ ok: false, msg: data.error });
                set_display_status();
            });
    }
    function get_timeline() {
        fetch(process.env.API_URL + '/cal/' + id + '/meetme/me', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === 'ok')
                    if (data.timeline[0].timeline[0])
                        set_timeline(data.timeline[0].timeline[0].times);
                    else set_timeline([]);
                else set_display({ ok: false, msg: data.error });
                set_display_status();
            });
    }
    function get_meetme() {
        fetch(process.env.API_URL + '/cal/' + id + '/meetme', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === 'ok') set_meetme(data);
                else set_display({ ok: false, msg: data.error });
                set_display_status();
            });
    }
    function get_memberlist() {
        fetch(process.env.API_URL + '/cal/' + id + '/memberlist', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === 'ok') {
                    set_memberlist(data);
                } else set_display({ ok: false, msg: data.error });
                set_display_status();
            });
    }
    function get_meet_time() {
        fetch(process.env.API_URL + '/cal/' + id + '/meet_time', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === 'ok') {
                    set_meet_time(data);
                } else set_display({ ok: false, msg: data.error });
                set_display_status();
            });
    }

    function get_org_memberlist(org_id) {
        fetch(process.env.API_URL + '/org/' + org_id + '/memberlist', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                set_org_memberlist(data);
            });
    }

    useEffect(() => {
        if (
            meetme === null ||
            timeblocks === null ||
            meetme.Status !== 'ok' ||
            timeblocks.Status !== 'ok'
        )
            return;
        let cuts = [];
        meetme.users.forEach((user) => {
            user.times.forEach((time) => {
                cuts.push(time.start, time.end);
            });
        });
        timeblocks.timeblocks.forEach((time) => {
            cuts.push(time.start, time.end);
            let d = new Date(time.start);
            d.setMilliseconds(0);
            d.setSeconds(0);
            d.setHours(0);
            cuts.push(d.valueOf());

            d = new Date(time.end);
            d.setMilliseconds(0);
            d.setSeconds(0);
            d.setHours(0);
            cuts.push(d.valueOf());
        });
        cuts = Array.from(new Set(cuts));
        cuts.sort((a, b) => {
            return a - b;
        });

        //remove duplicate times
        const single_timeline = [];
        for (let i = 1; i < cuts.length; i++) {
            single_timeline.push({ start: cuts[i - 1], end: cuts[i], users: null });
        }

        // marks valid blocks in timeline by setting users to an array
        timeblocks.timeblocks.forEach((valid_time) => {
            for (let i = 0; i < single_timeline.length; i++) {
                if (
                    valid_time.start <= single_timeline[i].start &&
                    valid_time.end >= single_timeline[i].end
                ) {
                    single_timeline[i].users = [];
                }
            }
        });
        single_timeline.push({
            start: single_timeline[single_timeline.length - 1].end,
            end: Number.MAX_VALUE,
            available_users: null,
        });

        meetme.users.forEach((user) => {
            user.times.forEach((newBlock) => {
                for (let i = 0; i < single_timeline.length; i++) {
                    if (
                        newBlock.start <= single_timeline[i].start &&
                        newBlock.end >= single_timeline[i].end
                    ) {
                        if (single_timeline[i].users != null) {
                            console.log(user);
                            single_timeline[i].users.push(user._id);
                        }
                    }
                }
            });
        });

        let meetme_day_obj = {
            date: new Date(single_timeline[0].start).toLocaleDateString('en-US'),
            times: [],
        };
        const final_daysplit_meetme = [];
        for (let i = 0; i < single_timeline.length - 1; i++) {
            const start_block = single_timeline[i].start;
            const start_str = new Date(start_block).toLocaleDateString('en-US');
            //console.log('checking '+JSON.stringify(single_timeline[i]));

            //start in correct day
            if (start_str === meetme_day_obj.date) {
                //end in correct day
                meetme_day_obj.times.push({
                    start: single_timeline[i].start,
                    available_users: single_timeline[i].users,
                });
            }
            //in next day so we change day and then retry
            else {
                final_daysplit_meetme.push(meetme_day_obj);
                meetme_day_obj = {
                    date: start_str,
                    times: [],
                };
                i--;
            }
        }
        meetme_day_obj.times.push({
            start: timeblocks.timeblocks[timeblocks.timeblocks.length - 1].end,
            available_users: null,
        });
        //console.log(final_daysplit_meetme);

        final_daysplit_meetme.push(meetme_day_obj);
        for (let i = 0; i < final_daysplit_meetme.length; i++) {
            const day = final_daysplit_meetme[i];
            while (day.times[0].available_users === null) {
                day.times = day.times.slice(1);
            }
        }

        //console.log(final_daysplit_meetme);
        set_meetme_passthrough(final_daysplit_meetme);
    }, [meetme, timeline]);

    function set_display_status() {
        if (
            cal_metadata === null ||
            cal_maindata === null ||
            timeblocks === null ||
            timeline === null ||
            meetme === null ||
            memberlist === null ||
            meet_time === null
        ) {
            return;
        }

        if (
            cal_metadata.Status === 'ok' ||
            cal_maindata.Status === 'ok' ||
            timeblocks.Status === 'ok' ||
            timeline.Status === 'ok' ||
            meetme.Status === 'ok' ||
            memberlist.Status === 'ok' ||
            meet_time.Status === 'ok'
        ) {
            set_display({ ok: true, msg: null });
        }
    }
    function setup_sockets() {
        function handle_calendar_updates(operation, target) {
            // console.log('socket');
            // console.log(JSON.stringify(operation));
            // console.log(JSON.stringify(target));
            switch (target) {
                case 'meetme':
                    // console.log('got meetme update');
                    get_meetme();
                    break;
                case 'timeline':
                    // console.log('got timeline update');
                    break;
                case 'memberlist':
                    //   console.log('got memberlist update');
                    get_memberlist();
                    break;
            }
        }
        socket.on(id, handle_calendar_updates);

        //console.log('connecting');
        socket.emit('join cal', id);

        return () => {
            socket.off(id, handle_calendar_updates);
        };
    }

    if (display.ok === false && display.msg === 'loading')
        return (
            <div>
                <p>Fetching calendar data</p>
            </div>
        );
    else if (display.ok === false) {
        return (
            <div>
                <p>Error</p>
                <p>{display.msg}</p>
            </div>
        );
    } else if (meetme_passthrough === null) {
        return (
            <div>
                <p>parsing data</p>
            </div>
        );
    }

    if (cal_metadata.metadata.owner.owner_type === 'individual')
        if (cal_metadata.metadata.owner._id === getUser().uid)
            return (
                <CalendarOwner
                    metadata={cal_metadata.metadata}
                    maindata={cal_maindata.maindata}
                    meetme={meetme_passthrough}
                    memberlist={memberlist.memberlist}
                    timeline={timeline}
                    timeblocks={timeblocks.timeblocks}
                    meeting_time={meet_time.meeting_time}
                    timeline_setstate={set_timeline}
                />
            );
        else if (
            cal_maindata.maindata.viewers.some((uname) => {
                return uname._id === getUser().uid;
            })
        )
            return (
                <CalendarViewer
                    metadata={cal_metadata.metadata}
                    maindata={cal_maindata.maindata}
                    meetme={meetme_passthrough}
                    memberlist={memberlist.memberlist}
                    timeline={timeline}
                    timeblocks={timeblocks.timeblocks}
                    meeting_time={meet_time.meeting_time}
                    timeline_setstate={set_timeline}
                />
            );
        else
            return (
                <CalendarUser
                    metadata={cal_metadata.metadata}
                    maindata={cal_maindata.maindata}
                    meetme={meetme_passthrough}
                    memberlist={memberlist.memberlist}
                    timeline={timeline}
                    timeblocks={timeblocks.timeblocks}
                    meeting_time={meet_time.meeting_time}
                    timeline_setstate={set_timeline}
                />
            );

    if (org_memberlist === null) return <div>Fetching org data</div>;

    if (org_memberlist.Status === 'error') {
        return (
            <div>Error getting org memberlist message: {org_memberlist.error}</div>
        );
    }

    //able to edit calendars
    if (org_memberlist.memberlist.owner === getUser().uid)
        return (
            <CalendarOwner
                metadata={cal_metadata.metadata}
                maindata={cal_maindata.maindata}
                meetme={meetme_passthrough}
                memberlist={memberlist.memberlist}
                timeline={timeline}
                timeblocks={timeblocks.timeblocks}
                meeting_time={meet_time.meeting_time}
                timeline_setstate={set_timeline}
                org_memberlist={org_memberlist.memberlist}
            />
        );
    if (
        org_memberlist.memberlist.admins.some((uname) => {
            return uname._id === getUser().uid;
        })
    )
        return (
            <CalendarOwner
                metadata={cal_metadata.metadata}
                maindata={cal_maindata.maindata}
                meetme={meetme_passthrough}
                memberlist={memberlist.memberlist}
                timeline={timeline}
                timeblocks={timeblocks.timeblocks}
                meeting_time={meet_time.meeting_time}
                timeline_setstate={set_timeline}
                org_memberlist={org_memberlist.memberlist}
            />
        );
    if (
        org_memberlist.memberlist.editors.some((uname) => {
            return uname._id === getUser().uid;
        })
    )
        return (
            <CalendarEditor
                metadata={cal_metadata.metadata}
                maindata={cal_maindata.maindata}
                meetme={meetme_passthrough}
                memberlist={memberlist.memberlist}
                timeline={timeline}
                timeblocks={timeblocks.timeblocks}
                meeting_time={meet_time.meeting_time}
                timeline_setstate={set_timeline}
                org_memberlist={org_memberlist.memberlist}
            />
        );

    //is a viewer
    if (
        org_memberlist.memberlist.viewers.some((uname) => {
            return uname._id === getUser().uid;
        })
    )
        return (
            <CalendarViewer
                metadata={cal_metadata.metadata}
                maindata={cal_maindata.maindata}
                meetme={meetme_passthrough}
                memberlist={memberlist.memberlist}
                timeline={timeline}
                timeblocks={timeblocks.timeblocks}
                meeting_time={meet_time.meeting_time}
                timeline_setstate={set_timeline}
                org_memberlist={org_memberlist.memberlist}
            />
        );
    if (
        cal_maindata.maindata.viewers.some((uname) => {
            return uname._id === getUser().uid;
        })
    )
        return (
            <CalendarViewer
                metadata={cal_metadata.metadata}
                maindata={cal_maindata.maindata}
                meetme={meetme_passthrough}
                memberlist={memberlist.memberlist}
                timeline={timeline}
                timeblocks={timeblocks.timeblocks}
                meeting_time={meet_time.meeting_time}
                timeline_setstate={set_timeline}
                org_memberlist={org_memberlist.memberlist}
            />
        );

    //is a regular user
    return (
        <CalendarUser
            metadata={cal_metadata.metadata}
            maindata={cal_maindata.maindata}
            meetme={meetme_passthrough}
            memberlist={memberlist.memberlist}
            timeline={timeline}
            timeblocks={timeblocks.timeblocks}
            meeting_time={meet_time.meeting_time}
            timeline_setstate={set_timeline}
            org_memberlist={org_memberlist.memberlist}
        />
    );
}

export default CalendarLoader;
