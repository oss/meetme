import '../../../index.css';
import { useState, useEffect } from 'react';
import uniqid from 'uniqid';

function GlobalCalendar({ meetme_input, memberlist_input }) {
    const unavailable = 'rgb(255,0,0)';
    const target_block_height = 2;

    const [cal_span, set_cal_span] = useState(() => {
        let early_day_start = new Date(meetme_input[0].times[0].start);
        early_day_start = {
            hour: early_day_start.getHours(),
            minute: early_day_start.getMinutes(),
        };
        //set the earliest hour + minute
        for (let i = 1; i < meetme_input.length; i++) {
            const potential_date = new Date(meetme_input[i].times[0].start);
            if (early_day_start.hour > potential_date.getHours()) {
                early_day_start.hour = potential_date.getHours();
                early_day_start.minute = potential_date.getMinutes();
                continue;
            }
            if (
                early_day_start.minute > potential_date.getMinutes() &&
        potential_date.getHours() === early_day_start.hour
            )
                early_day_start.minute = potential_date.getMinutes();
        }

        let late_time_end = new Date(meetme_input[0].times[0].start);
        late_time_end = {
            hour: late_time_end.getHours(),
            minute: late_time_end.getMinutes(),
        };

        for (let i = 0; i < meetme_input.length; i++) {
            const potential_date = new Date(
                meetme_input[i].times[meetme_input[i].times.length - 1].start
            );
            //console.log('testing: '+potential_date);
            if (late_time_end.hour < potential_date.getHours()) {
                late_time_end.hour = potential_date.getHours();
                late_time_end.minute = potential_date.getMinutes();
                continue;
            }
            if (
                late_time_end.minute < potential_date.getMinutes() &&
        potential_date.getHours() === late_time_end.hour
            )
                late_time_end.minute = potential_date.getMinutes();
        }
        //set the latest hour + minute
        //console.log(early_day_start);
        //console.log(late_time_end);
        return {
            start: early_day_start,
            end: late_time_end,
        };
    }, []);

    const [timeblocks_per_day, we_should_not_be_setting_this_at_all] =
    useState(() => {
        let start_time = new Date(
            2000,
            0,
            1,
            cal_span.start.hour,
            cal_span.start.minute
        );
        let end_time = new Date(
            2000,
            0,
            1,
            cal_span.end.hour,
            cal_span.end.minute
        );
        const diff = end_time.valueOf() - start_time.valueOf();
        return diff / (1000 * 60);
    }, [cal_span]);

    const [times, set_times] = useState(() => {
        let x = 10; //minutes interval
        let times = []; // time array
        let tt = cal_span.start.hour * 60 + cal_span.start.minute; // start time
        let et = cal_span.end.hour * 60 + cal_span.end.minute; //end time
        let ap = ['AM', 'PM']; // AM-PM

        if (cal_span.start.minute % 10 !== 0) {
            let str =
        ('0' + (cal_span.start.hour % 12)).slice(-2) +
        ':' +
        ('0' + cal_span.start.minute).slice(-2);
            str += ap[Math.floor(cal_span.start.hour / 12)];
            if (str.startsWith('00')) {
                str = '12' + str.slice(2);
            }
            times[0] = str;
            tt += 10 - (cal_span.start.minute % 10);
        }

        //loop to increment the time and push results in array

        for (let i = 0; tt <= et; i++) {
            let hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
            let mm = tt % 60; // getting minutes of the hour in 0-55 format
            let str = ('0' + (hh % 12)).slice(-2) + ':' + ('0' + mm).slice(-2); // pushing data in array in [00:00 - 12:00 AM/PM format]
            if (str.startsWith('00')) {
                str = '12' + str.slice(2);
            }
            str += ap[Math.floor(hh / 12)];
            times.push(str);
            tt = tt + x;
        }
        /*
        this adds a time to the end, i'm not sure if we want this
        if(cal_span.end.minute % 10 !== 0){
            let str = ("0" + (cal_span.end.hour % 12)).slice(-2) + ':' + ("0" + cal_span.end.minute).slice(-2);
            str += ap[Math.floor(cal_span.end.hour/12)];
            if(str.startsWith("00")){
                str='12'+str.slice(2);
            }
            times.push(str);
        }
        */
        return times;
    }, [cal_span]);

    function calc_color(people_arr) {
        if (people_arr === null) return unavailable;
        const number_of_people = people_arr.length;
        const max_green = 255;
        let rb = 255;
        if (number_of_people !== 0) {
            rb =
        255 - ((10 * number_of_people) / (12 * memberlist_input.length)) * 255;
            return 'rgb(' + max_green + ', ' + rb + ', ' + (rb + 20) + ')';
        }
        return 'rgb(' + rb + ', ' + max_green + ', ' + rb + ')';
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
            <div style={{ gridRowStart: 1, gridColumnStart: 1 }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
              '50px repeat(' + meetme_input.length + ',auto)',
                    }}
                >
                    <div key={uniqid()} style={{ gridColumn: 1, gridRow: 1 }}></div>
                    {meetme_input.map((seg, idx) => {
                        return (
                            <div style={{ gridColumn: idx + 2, gridRow: 1 }}>
                                <div
                                    style={{
                                        fontSize: '0.875rem' /* 14px */,
                                        lineHeight: '1.25rem' /* 20px */,
                                        marginRight: '10px',
                                        marginLeft: '10px',
                                    }}
                                >
                                    {meetme_input[idx].date}
                                </div>
                            </div>
                        );
                    })}
                    {times.map((time, idx) => {
                        let sp = parseInt(time.charAt(4));
                        if (idx === 0) {
                            sp = 10 - sp;
                        } else if (idx === times.length - 1) {
                            sp = cal_span.end.minute % 10;
                        } else {
                            sp = 10;
                        }
                        return (
                            <>
                                <div
                                    style={{
                                        gridColumn: 1,
                                        gridRow: 'span ' + sp,
                                        height: sp * target_block_height,
                                    }}
                                    key={uniqid()}
                                >
                  &nbsp;
                                </div>
                            </>
                        );
                    })}
                    {meetme_input.map((day, idx) => {
                        //{"date":"8/11/2022","iso_string":"2022-08-11T12:00:00.000Z","times":[{"start":1660219200000,"available_users":[]}
                        const start_of_day = new Date(day.times[0].start);
                        start_of_day.setMilliseconds(0);
                        start_of_day.setSeconds(0);
                        start_of_day.setHours(cal_span.start.hour);
                        start_of_day.setMinutes(cal_span.start.minute);

                        //need to add unavaible block at beginning
                        return day.times.map((tb, i) => {
                            //extend beginning and do first timeblock
                            if (i === 0) {
                                const span = Math.floor(
                                    (tb.start - start_of_day) / (1000 * 60)
                                );
                                const tb_span = Math.floor(
                                    (day.times[i + 1].start - tb.start) / (1000 * 60)
                                );
                                let isHidden = false;
                                if (span === 0) isHidden = true;
                                if (isHidden)
                                    return (
                                        <div
                                            style={{
                                                gridColumn: idx + 2,
                                                gridRow: 2 + span + '/ span ' + tb_span,
                                                backgroundColor: calc_color(tb.available_users),
                                                height: tb_span * target_block_height + 'px',
                                            }}
                                            tag="1"
                                        ></div>
                                    );
                                return (
                                    <>
                                        <div
                                            style={{
                                                gridColumn: idx + 2,
                                                gridRow: '2 / span ' + span,
                                                backgroundColor: unavailable,
                                                height: span * target_block_height + 'px',
                                            }}
                                            tag="2"
                                        ></div>
                                        <div
                                            style={{
                                                gridColumn: idx + 2,
                                                gridRow: 2 + span + '/ span ' + tb_span,
                                                backgroundColor: calc_color(tb.available_users),
                                                height: tb_span * target_block_height + 'px',
                                            }}
                                            tag="2"
                                        ></div>
                                    </>
                                );
                            }
                            //extend end to last timeblock
                            const row_start =
                2 +
                Math.floor((day.times[i].start - start_of_day) / (1000 * 60));
                            let style = {
                                gridColumn: idx + 2,
                                backgroundColor: calc_color(tb.available_users),
                            };
                            if (i === day.times.length - 1) {
                                style.gridRowStart = row_start;
                                style.gridRowEnd = 2 + timeblocks_per_day;
                                style.height =
                  (style.gridRowEnd - style.gridRowStart) *
                    target_block_height +
                  'px';

                                if (style.gridRowEnd == style.gridRowStart)
                                    return (
                                        <div hidden key={uniqid()} style={style} tag="3"></div>
                                    );
                            } else {
                                let span = Math.floor(
                                    (day.times[i + 1].start - day.times[i].start) / (1000 * 60)
                                );
                                style.gridRow = row_start + ' / span ' + span;
                                style.height = span * target_block_height;
                                style.height += 'px';
                                if (span == 0)
                                    return (
                                        <div hidden key={uniqid()} style={style} tag="4"></div>
                                    );
                            }

                            return (
                                <div
                                    key={uniqid()}
                                    title={(() => {
                                        if (tb.available_users === null) return;
                                        let users = `Total users: ${tb.available_users.length}\n`;
                                        tb.available_users.forEach((user) => {
                                            users += user + '\n';
                                        });
                                        if (tb.available_users.length != 0) {
                                            return users;
                                        }
                                    })()}
                                    style={style}
                                    tag="5"
                                ></div>
                            );
                        });
                    })}
                </div>
            </div>
            <div
                style={{ gridRowStart: 1, gridColumnStart: 1, pointerEvents: 'none' }}
            >
                <div
                    style={{
                        display: 'grid',
                        userSelect: 'none',
                        position: 'relative',
                        top: '-5px',
                    }}
                >
                    <div key={uniqid()} style={{ gridColumn: 1, gridRow: 1 }}>
            &nbsp;
                    </div>
                    {times.map((time, idx) => {
                        let sp = parseInt(time.charAt(4));
                        if (idx === 0) {
                            sp = 10 - sp;
                        } else if (idx === times.length - 1) {
                            sp = cal_span.end.minute % 10;
                        } else {
                            sp = 10;
                        }
                        return (
                            <>
                                <div
                                    style={{
                                        gridColumn: 1,
                                        gridRow: 'span ' + sp,
                                        display: 'inline-flex',
                                    }}
                                    key={uniqid()}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            position: 'relative',
                                            top: '-50%',
                                            fontSize: 'x-small',
                                            height: sp * target_block_height,
                                            textAlign: 'center',
                                            minWidth: '50px',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {idx == 0 || time.includes('30') || time.includes('00')
                                            ? time
                                            : ''}
                                    </div>
                                    <hr
                                        className="border-t-blue-600/20 border-t-[1px]"
                                        style={{ display: 'inline-flex', width: '100%' }}
                                    ></hr>
                                </div>
                            </>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default GlobalCalendar;
