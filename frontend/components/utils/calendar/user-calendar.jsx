import { useState, useEffect } from 'react';
import uniqid from 'uniqid';

function UserCalendar({
    cal_id,
    meetme_input,
    timeline_input,
    timeblocks_input,
    timeline_setstate,
}) {
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

    const available = 'rgba(14, 165, 233, 0.4)';
    const unavailable = 'rgb(243, 244, 246)';
    const target_block_height = 2;
    const [blocks, set_blocks] = useState([]);

    useEffect(() => {
        const arr = [];
        let tb_ctr = 0;
        let tmln_ctr = 0;

        for (let day_count = 0; day_count < meetme_input.length; day_count++) {
            let tile_span = new Date(timeblocks_input[day_count].start);
            tile_span.setHours(cal_span.start.hour);
            tile_span.setMinutes(cal_span.start.minute);
            tile_span.setMilliseconds(0);
            tile_span = tile_span.valueOf();

            tile_span = {
                start: tile_span,
                end: tile_span + 1000 * 60,
            };
            for (let tb_count = 0; tb_count < timeblocks_per_day; tb_count++) {
                while (
                    tb_ctr < timeblocks_input.length &&
          timeblocks_input[tb_ctr].end <= tile_span.start
                ) {
                    //console.log('skip');
                    tb_ctr += 1;
                }
                if (tb_ctr === timeblocks_input.length) {
                    arr.push(
                        <div
                            style={{
                                gridColumn: day_count + 2,
                                gridRow: 2 + tb_count + '/ span 1',
                            }}
                            id={'usercal_col' + day_count + '_row' + tb_count}
                            onMouseOver={(event) => {
                                dragUpdate(event);
                            }}
                            onMouseUp={(event) => {
                                dragEnd(event);
                            }}
                            onMouseLeave={(event) => {
                                const moved_to = event.relatedTarget;
                                if (
                                    hover.isClicking &&
                  (moved_to instanceof Window ||
                    !moved_to.id.match(/usercal_col[0-9]+_row[0-9]+/))
                                )
                                    dragEnd(event);
                            }}
                        ></div>
                    );
                    tile_span.start += 1000 * 60;
                    tile_span.end += 1000 * 60;
                    continue;
                }
                if (
                    tile_span.start >= timeblocks_input[tb_ctr].start &&
          tile_span.end <= timeblocks_input[tb_ctr].end
                ) {
                    while (
                        tmln_ctr < timeline_input.length &&
            timeline_input[tmln_ctr].end <= tile_span.start
                    ) {
                        tmln_ctr += 1;
                    }
                    let bg_color = null;
                    if (tmln_ctr === timeline_input.length) {
                        bg_color = unavailable;
                    } else if (
                        tile_span.start >= timeline_input[tmln_ctr].start &&
            tile_span.end <= timeline_input[tmln_ctr].end
                    ) {
                        bg_color = available;
                    } else {
                        bg_color = unavailable;
                    }

                    arr.push(
                        <div
                            style={{
                                gridColumn: day_count + 2,
                                gridRow: 2 + tb_count + '/ span 1',
                                backgroundColor: bg_color,
                                height: target_block_height,
                            }}
                            id={'usercal_col' + day_count + '_row' + tb_count}
                            onMouseDown={(event) => {
                                dragStart(event);
                            }}
                            onMouseOver={(event) => {
                                dragUpdate(event);
                            }}
                            onMouseUp={(event) => {
                                dragEnd(event);
                            }}
                            defaultbackgroundcolor={bg_color}
                            onMouseLeave={(event) => {
                                const moved_to = event.relatedTarget;
                                console.log(moved_to instanceof Window);
                                if (
                                    hover.isClicking &&
                  (moved_to instanceof Window ||
                    !moved_to.id.match(/usercal_col[0-9]+_row[0-9]+/))
                                )
                                    dragEnd(event);
                            }}
                        >
              &nbsp;
                        </div>
                    );
                } else {
                    arr.push(
                        <div
                            style={{
                                gridColumn: day_count + 2,
                                gridRow: 2 + tb_count + '/ span 1',
                                height: target_block_height,
                            }}
                            id={'usercal_col' + day_count + '_row' + tb_count}
                            onMouseOver={(event) => {
                                dragUpdate(event);
                            }}
                            onMouseUp={(event) => {
                                dragEnd(event);
                            }}
                            defaultbackgroundcolor={'auto'}
                            onMouseLeave={(event) => {
                                const moved_to = event.relatedTarget;
                                if (
                                    hover.isClicking &&
                  (moved_to instanceof Window ||
                    !moved_to.id.match(/usercal_col[0-9]+_row[0-9]+/))
                                )
                                    dragEnd(event);
                            }}
                        ></div>
                    );
                }
                tile_span.start += 1000 * 60;
                tile_span.end += 1000 * 60;
            }
        }
        set_blocks(arr);
    }, [timeline_input]);

    const hover = {
        isClicking: false,
        mode: null,
        start: { x: null, y: null },
        end: { x: null, y: null },
    };
    function dragStart(e) {
    //console.log('drag start');
    //console.log(e);
        if (e.button !== 0) return;

        hover.start.y = parseInt(e.target.id.match(/usercal_col\d+_row(\d+)/)[1]);
        hover.start.x = parseInt(e.target.id.match(/usercal_col(\d+)_row\d+/)[1]);
        hover.end.y = hover.start.y;
        hover.end.x = hover.start.x;
        hover.isClicking = true;

        if (
            document.getElementById(e.target.id).style.backgroundColor === available
        ) {
            document.getElementById(e.target.id).style.backgroundColor = unavailable;
            hover.mode = 'remove';
        } else {
            document.getElementById(e.target.id).style.backgroundColor = available;
            hover.mode = 'add';
        }
    }

    const temp_changes_element_id = [];
    function dragUpdate(e) {
        if (!hover.isClicking) {
            return;
        }

        hover.end.y = parseInt(e.target.id.match(/usercal_col\d+_row(\d+)/)[1]);
        hover.end.x = parseInt(e.target.id.match(/usercal_col(\d+)_row\d+/)[1]);

        let top_left = {
            x: null,
            y: null,
        };
        let bottom_right = {
            x: null,
            y: null,
        };

        if (hover.start.x < hover.end.x) {
            top_left.x = hover.start.x;
            bottom_right.x = hover.end.x;
        } else {
            top_left.x = hover.end.x;
            bottom_right.x = hover.start.x;
        }

        if (hover.start.y < hover.end.y) {
            top_left.y = hover.start.y;
            bottom_right.y = hover.end.y;
        } else {
            top_left.y = hover.end.y;
            bottom_right.y = hover.start.y;
        }

        for (let i = 0; i < temp_changes_element_id.length; i++) {
            const tile_id = temp_changes_element_id[i];
            const tile = document.getElementById(tile_id);
            if (hover.mode === 'add') {
                tile.style.backgroundColor = tile.getAttribute(
                    'defaultbackgroundcolor'
                );
            } else if (hover.mode === 'remove') {
                tile.style.backgroundColor = tile.getAttribute(
                    'defaultbackgroundcolor'
                );
            }
        }
        temp_changes_element_id.length = 0;

        for (let x = top_left.x; x <= bottom_right.x; x++) {
            for (let y = top_left.y; y <= bottom_right.y; y++) {
                if (document.getElementById('usercal_col' + x + '_row' + y) === null) {
                    continue;
                }
                const tile_id = 'usercal_col' + x + '_row' + y;
                if (
                    document
                        .getElementById(tile_id)
                        .getAttribute('defaultbackgroundcolor') === 'auto'
                )
                    continue;
                if (hover.mode === 'add') {
                    document.getElementById(tile_id).style.backgroundColor = available;
                } else if (hover.mode === 'remove') {
                    document.getElementById(tile_id).style.backgroundColor = unavailable;
                }
                temp_changes_element_id.push(tile_id);
            }
        }
    }

    function dragEnd(e) {
        temp_changes_element_id.length = 0;
        save();
        hover.isClicking = false;
        hover.mode = null;
    //console.log('ended clicking status');
    }

    function save() {
        if (!hover.isClicking) return;
        const changes = [];

        let top_left = {
            x: null,
            y: null,
        };
        let bottom_right = {
            x: null,
            y: null,
        };

        if (hover.start.x < hover.end.x) {
            top_left.x = hover.start.x;
            bottom_right.x = hover.end.x;
        } else {
            top_left.x = hover.end.x;
            bottom_right.x = hover.start.x;
        }

        if (hover.start.y < hover.end.y) {
            top_left.y = hover.start.y;
            bottom_right.y = hover.end.y;
        } else {
            top_left.y = hover.end.y;
            bottom_right.y = hover.start.y;
        }

        for (let day_diff = top_left.x; day_diff <= bottom_right.x; day_diff++) {
            let start_day = new Date(timeblocks_input[day_diff].start);
            start_day.setHours(cal_span.start.hour);
            start_day.setMinutes(cal_span.start.minute);
            start_day.setMilliseconds(0);
            start_day = start_day.valueOf();
            const segment_duration = (bottom_right.y - top_left.y + 1) * (1000 * 60);
            const start = start_day + top_left.y * 1000 * 60;
            const end = start + segment_duration;
            changes.push({ start: start, end: end });
        }

        /*
        for(let i=0;i<changes.length;i++){
            changes[i].start = new Date(changes[i].start);
            changes[i].end = new Date(changes[i].end);
        }
        //console.log(changes);
        return;
        */

        if (hover.mode === 'add') {
            const squish = [...changes, ...timeline_input];
            //console.log(squish)
            squish.sort(function (a, b) {
                return a.start - b.start;
            });

            const merged = [];
            let previous = squish[0];

            for (let i = 1; i < squish.length; i += 1) {
                if (previous.end >= squish[i].start) {
                    previous = {
                        start: previous.start,
                        end: Math.max(previous.end, squish[i].end),
                    };
                } else {
                    merged.push(previous);
                    previous = squish[i];
                }
            }
            merged.push(previous);

            /*
            //console.log('merged')
            for(let i=0;i<merged.length;i++){
                merged[i].start = new Date(merged[i].start);
                merged[i].end = new Date(merged[i].end);
            }
            //console.log(merged);
            return;
            */

            //truncate times outside of timeblocks
            const final_timeline = [];
            for (let i = 0; i < timeblocks_input.length; i++) {
                const tb_obj = timeblocks_input[i];

                let mg_start_idx = null;
                for (let ii = 0; ii < merged.length; ii++) {
                    if (merged[ii].end > tb_obj.start) {
                        mg_start_idx = ii;
                        break;
                    }
                }
                let mg_end_idx = null;
                for (let ii = merged.length - 1; ii >= 0; ii--) {
                    if (tb_obj.end > merged[ii].start) {
                        mg_end_idx = ii;
                        break;
                    }
                }
                //console.log('mg_start: '+mg_start_idx);
                //console.log('mg_end: '+mg_end_idx);

                if (mg_end_idx === null || mg_start_idx === null) continue;

                let tb_str = '';
                let mg_str = '';
                let fn_str = '';

                if (timeblocks_input[i].start > merged[mg_start_idx].start)
                    tb_str += String('0').repeat(
                        (timeblocks_input[i].start - merged[mg_start_idx].start) /
              (1000 * 60)
                    );
                else
                    mg_str += String('0').repeat(
                        (merged[mg_start_idx].start - timeblocks_input[i].start) /
              (1000 * 60)
                    );

                tb_str += String('1').repeat(
                    (timeblocks_input[i].end - timeblocks_input[i].start) / (1000 * 60)
                );

                for (let ii = mg_start_idx; ii <= mg_end_idx; ii++) {
                    mg_str += String('1').repeat(
                        (merged[ii].end - merged[ii].start) / (1000 * 60)
                    );
                    if (ii !== mg_end_idx)
                        mg_str += String('0').repeat(
                            (merged[ii + 1].start - merged[ii].end) / (1000 * 60)
                        );
                }

                if (merged[mg_end_idx].end > timeblocks_input[i].end)
                    tb_str += String('0').repeat(
                        (merged[mg_end_idx].end - timeblocks_input[i].end) / (1000 * 60)
                    );
                else
                    mg_str += String('0').repeat(
                        (timeblocks_input[i].end - merged[mg_end_idx].end) / (1000 * 60)
                    );

                for (let ii = 0; ii < tb_str.length; ii++) {
                    if (tb_str.charAt(ii) === '0') {
                        fn_str += '0';
                    } else fn_str += mg_str.charAt(ii);
                }
                let total_front_tb = 0;
                for (let i = 0; i < tb_str.length; i++)
                    if (tb_str.charAt(i) === '0') total_front_tb += 1;
                    else break;

                //console.log('mg: '+mg_str);
                //console.log('tb: '+tb_str);
                //console.log('fn: '+fn_str);
                let b = null;
                const base = timeblocks_input[i].start - 1000 * 60 * total_front_tb;
                for (let i = 0; i < tb_obj.length; i++)
                    if (tb_obj.charAt(i) === '0') base = base - 1000 * 60;
                    else break;
                for (let ii = 0; ii < fn_str.length; ii++) {
                    if (b === null) {
                        if (fn_str.charAt(ii) === '1')
                            b = {
                                start: base + ii * 1000 * 60,
                                end: base + (ii + 1) * 1000 * 60,
                            };
                    } else {
                        if (fn_str.charAt(ii) === '0') {
                            final_timeline.push(b);
                            b = null;
                        } else {
                            b.end += 1000 * 60;
                        }
                    }
                }
                if (b !== null) final_timeline.push(b);
            }
            /*
            for(let i=0;i<final_timeline.length;i++){
                final_timeline[i].start = new Date(final_timeline[i].start);
                final_timeline[i].end = new Date(final_timeline[i].end);
            }
            //console.log(final_timeline);
            return;
            */

            fetch(process.env.API_URL + '/cal/' + cal_id + '/me', {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timeblocks: final_timeline,
                    mode: 'replace',
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                });

            timeline_setstate([...final_timeline]);
        } else {
            const final_time_array = [];
            let changed_cursor = 0;
            for (
                let timeline_cursor = 0;
                timeline_cursor < timeline_input.length;
                timeline_cursor++
            ) {
                if (changed_cursor === changes.length) {
                    //console.log('a');
                    final_time_array.push(timeline_input[timeline_cursor]);
                    continue;
                }
                const timeline_segment = timeline_input[timeline_cursor];
                let changed_segments = [];
                if (
                    changed_cursor === changes.length - 1 &&
          changes[changes.length - 1].end < timeline_segment.start
                ) {
                    //console.log('b');
                    final_time_array.push(timeline_input[timeline_cursor]);
                    changed_cursor = changes.length;
                    continue;
                }
                while (
                    changed_cursor < changes.length &&
          changes[changed_cursor].start < timeline_segment.end
                ) {
                    changed_segments.push({ ...changes[changed_cursor] });
                    changed_cursor += 1;
                }
                if (changed_segments.length === 0) {
                    final_time_array.push(timeline_input[timeline_cursor]);
                    continue;
                }

                //we remove one because the last changed timeblock may also apply extend to the next timeline timeblock
                changed_cursor--;

                let timeline_str = '';
                let changes_str = '';
                let buffer = timeline_segment.start - changed_segments[0].start;
                if (buffer > 0) timeline_str += '0'.repeat(buffer / (1000 * 60));
                else changes_str += '0'.repeat((buffer / (1000 * 60)) * -1);

                timeline_str += '1'.repeat(
                    (timeline_segment.end - timeline_segment.start) / (1000 * 60)
                );
                for (let i = 0; i < changed_segments.length; i++) {
                    let changed_block = changed_segments[i];
                    changes_str += '1'.repeat(
                        (changed_block.end - changed_block.start) / (1000 * 60)
                    );
                    if (i !== changed_segments.length - 1) {
                        changes_str += '0'.repeat(
                            (changed_segments[i + 1].start - changed_block.end) / (1000 * 60)
                        );
                    }
                }
                let final_str = '';
                for (let i = 0; i < timeline_str.length; i++) {
                    if (changes_str.charAt(i) === '1') final_str += '0';
                    else final_str += timeline_str.charAt(i);
                }
                if (buffer > 0) final_str = final_str.substring(buffer / (1000 * 60));

                let b = null;
                const base = timeline_segment.start;
                for (let i = 0; i < final_str.length; i++) {
                    if (b === null) {
                        if (final_str.charAt(i) === '1')
                            b = {
                                start: base + i * 1000 * 60,
                                end: base + (i + 1) * 1000 * 60,
                            };
                    } else {
                        if (final_str.charAt(i) === '0') {
                            final_time_array.push(b);
                            b = null;
                        } else {
                            b.end += 1000 * 60;
                        }
                    }
                }
                if (b !== null) final_time_array.push(b);
                //console.log('mg: '+changes_str);
                //console.log('tb: '+timeline_str);
                //console.log('fn: '+final_str);
            }

            /*
            for(let i=0;i<final_time_array.length;i++){
                final_time_array[i].start = new Date(final_time_array[i].start);
                final_time_array[i].end = new Date(final_time_array[i].end);
            }
            //console.log(final_time_array);
            */

            fetch(process.env.API_URL + '/cal/' + cal_id + '/me', {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timeblocks: final_time_array,
                    mode: 'replace',
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                });
            timeline_setstate([...final_time_array]);
        }
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
            <div style={{ gridRowStart: 1, gridColumnStart: 1 }}>
                <div
                    style={{
                        display: 'grid',
                        userSelect: 'none',
                        gridTemplateColumns:
              '50px repeat(' + meetme_input.length + ',auto)',
                    }}
                >
                    <div style={{ gridColumn: 1, gridRow: 1 }}></div>
                    {meetme_input.map((seg, idx) => {
                        return (
                            <div
                                style={{
                                    gridColumn: idx + 2,
                                    gridRow: 1,
                                    fontSize: '0.875rem' /* 14px */,
                                    lineHeight: '1.25rem' /* 20px */,
                                    marginRight: '10px',
                                    marginLeft: '10px',
                                }}
                                key={uniqid()}
                            >
                                {seg.date}
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
                        );
                    })}
                    {blocks}
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
                                        {/* This is just to only display times in intervals of 30 mins, but also beginning  */}
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

export default UserCalendar;
