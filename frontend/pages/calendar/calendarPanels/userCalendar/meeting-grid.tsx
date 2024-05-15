import MeetingColumnHeader from "../components/meeting-column-header";
import MeetingBlock from "./meeting-block";
import {
    getGridFromBlocks,
    createMeetingArray,
    UserTimes,
    getRemovedTimeline,
    getSortedMergedTimeblocks,
} from "../utilities";

import calendarMaindataStore from '../../../../store/calendarMaindata';

import { useState } from 'react';

interface IMeetingGrid {
    potentialMeetings: Date[];
    collaborators: any[];
    rowsCount: number;
    timeIntervals: number;
    startHour: Date;
    displayHeight: number;

    meetingId: string;
    readonly: boolean;
    setSelectedUsers: (users: any[]) => void;
    globalTimeline: any;
}

export type TimeBlock = {
    start: number;
    end: number;
};

function MeetingGrid({ calID, rowsCount }) {
    const displayHeight: number = 0.9;

    const columnCount = calendarMaindataStore((store) => {
        return store.calendarData[calID].data.blocks.length
    });

    const globalTimeline = calendarMaindataStore((store) => {
        return store.calendarData[calID].data.users
    })

    const potentialMeetings = calendarMaindataStore((store) => {
        return store.calendarData[calID].data.blocks.map(
            (object: any, i: number) => {
                let date = new Date(object.start);
                return date;
            }
        )
    })

    const userTimes = calendarMaindataStore((store) => store.calendarData[calID].data.users)
    const validTimes = calendarMaindataStore((store) => store.calendarData[calID].data.blocks)

    const timeIntervals: number = 10;
    const [startHour, endHour] = calendarMaindataStore((store) => {
        const allowedTimes = store.calendarData[calID].data.blocks;

        return [
            new Date(allowedTimes[0].start),
            new Date(allowedTimes[0].end)
        ]
    })

    // This is the most important part of the code. It creates a 2D array of TimeBlocks that basically represents the entire grid.
    // the whole code depends on this array.
    const meetingArray: TimeBlock[][] = createMeetingArray(
        rowsCount,
        columnCount,
        potentialMeetings,
        startHour,
        timeIntervals
    );

    const allMembers = calendarMaindataStore((store) => {
        const calendar = store.calendarData[calID].data;
        const members = new Set();
        switch (calendar.owner.owner_type) {
            case 'individual':
                members.add(calendar.owner._id)

                calendar.users.forEach((member, index) => {
                    members.add(member._id)
                });

                return members;
        }

    })


    const usersAmtGrid = (() => {
        const userTimeIdx = userTimes.findIndex(function (t) { return t._id === "netid1" });
        const userTimeline = userTimes[userTimeIdx]

        const userGrid: boolean[][] = getGridFromBlocks(userTimeline.times, meetingArray);

        return userGrid;
    })()

    const userTimeline = (() => {
        const userTimeIdx = userTimes.findIndex(function (t) { return t._id === "netid1" });
        const userTimeline = userTimes[userTimeIdx].times

        return userTimeline;
    })()

    const [fromColumn, setFromColumn] = useState(-1);
    const [fromRow, setFromRow] = useState(-1);
    const [toColumn, setToColumn] = useState(-1);
    const [toRow, setToRow] = useState(-1);
    const [value, setValue] = useState(false);
    const [isSelectMode, setIsSelectMode] = useState(false);

    const topLeftCornerRow = Math.min(fromRow, toRow);
    const topLeftCornerColumn = Math.min(fromColumn, toColumn);

    const bottomRightCornerRow = Math.max(fromRow, toRow);
    const bottomRightCornerColumn = Math.max(fromColumn, toColumn);


    function selectFromHere(event: DragEvent<HTMLDivElement>) {

        const column: number = parseInt(
            event.currentTarget.getAttribute("data-col")
        );
        const row: number = parseInt(
            event.currentTarget.getAttribute("data-row")
        );
        console.log("selecting from here");
        setFromColumn(column);
        setFromRow(row);
        setToColumn(column);
        setToRow(row);

        setValue(!usersAmtGrid[row][column]);

        setIsSelectMode(true);
    }

    function updateDisplayGrid(event: DragEvent<HTMLDivElement>) {
        if (!isSelectMode) {
            return;
        }
        console.log('updating')

        const column: number = parseInt(
            event.currentTarget.getAttribute("data-col")
        );
        const row: number = parseInt(
            event.currentTarget.getAttribute("data-row")
        );

        setToColumn(column);
        setToRow(row);
    }

    function endSelection(event: DragEvent<HTMLDivElement>) {

        const column: number = parseInt(
            event.currentTarget.getAttribute("data-col")
        );
        const row: number = parseInt(
            event.currentTarget.getAttribute("data-row")
        );

        setToColumn(column);
        setToRow(row);

        saveSelection();

        setIsSelectMode(false);
    }

    function saveSelection() {
        if (!isSelectMode) {
            return;
        }
        /*
         * The following code will be used to upload the changes to the
         * backend... I know this code is scuffed.
         */

        let times: TimeBlock[] = [];
        for (
            let c: number = topLeftCornerColumn;
            c <= bottomRightCornerColumn;
            c++
        ) {
            const date: Date = potentialMeetings[c];

            if (date === undefined) {
                continue;
            }
            let start = meetingArray[c][topLeftCornerRow].start;
            // selecting over null blocks causes problems
            let end = meetingArray[c][bottomRightCornerRow].end;
            if (start == null && end == null) {
                continue;
            }
            if (start == null) {
                for (
                    let r: number = topLeftCornerRow;
                    r <= bottomRightCornerRow;
                    r++
                ) {
                    if (meetingArray[c][r].start != null) {
                        start = meetingArray[c][r].start;
                        break;
                    }
                }
            }
            if (end == null) {
                for (
                    let r: number = bottomRightCornerRow;
                    r >= topLeftCornerRow;
                    r--
                ) {
                    if (meetingArray[c][r].end != null) {
                        end = meetingArray[c][r].end;
                        break;
                    }
                }
            }
            times.push({
                start,
                end,
            });
        }

        console.log(times, userTimeline)

        let newTimeLine: TimeBlock[] = null;

        if (usersAmtGrid[fromRow][fromColumn]) {
            // Removing timeblocks
            newTimeLine = getRemovedTimeline(userTimeline, times);
        } else {
            // Adding timeblocks
            newTimeLine = getSortedMergedTimeblocks(userTimeline, times);
        }

        fetch(`${process.env.API_URL}/cal/${calID}/me`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                timeblocks: newTimeLine,
                mode: "replace",
            }),
        })

    }


    return (
        <div>
            <ol className="bg-gray-200 rounded-tl-lg flex">
                {potentialMeetings.map((x, i) => (
                    <li className="inline-flex">
                        <MeetingColumnHeader
                            month={x.getMonth()}
                            day={x.getDate()}
                            year={x.getFullYear()}
                            totalColumns={columnCount}
                            key={i}
                        />
                    </li>
                ))}
            </ol>
            <div className="flex" onMouseLeave={() => {
                if (isSelectMode) {
                    saveSelection();
                    setIsSelectMode(false);
                }
            }}>
                {meetingArray.map((day, c) => (
                    <div style={{ width: `${100 / columnCount}%` }} key={c}>
                        {day.map((timeBlock, r) => {

                            const betweenSelectedRows = topLeftCornerRow <= r && r <= bottomRightCornerRow;
                            const betweenSelectedColumns = topLeftCornerColumn <= c && c <= bottomRightCornerColumn;
                            const insideHighlightedRegion = betweenSelectedColumns && betweenSelectedRows;

                            let available = null;
                            if (value) {
                                if (usersAmtGrid[r][c] || insideHighlightedRegion)
                                    available = true;
                                else
                                    available = false;
                            }
                            else {
                                if ((usersAmtGrid[r][c] === false) || insideHighlightedRegion)
                                    available = false;
                                else
                                    available = true;
                            }

                            return (
                                <MeetingBlock
                                    displayHeight={displayHeight}
                                    column={c}
                                    row={r}
                                    start={timeBlock.start}
                                    end={timeBlock.end}
                                    key={c * rowsCount + r}
                                    available={available}
                                    onMouseDown={selectFromHere}
                                    onMouseOver={updateDisplayGrid}
                                    onMouseUp={endSelection}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

        </div>
    );
}

export default MeetingGrid;