import React, { DragEvent, useEffect, useState } from "react";
import MeetingColumnHeader from "./meeting-column-header";
import MeetingBlock from "./meeting-block";
import { socket } from "../../socket";
import {
    getRemovedTimeline,
    getSortedMergedTimeblocks,
    getGridFromBlocks,
    createMeetingArray,
    UserTimes,
} from "./utilities";
import { getUser } from "../../utils";

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
    globalTimeline:any;
}

export type TimeBlock = {
    start: number;
    end: number;
};

function MeetingGrid({
    potentialMeetings,
    collaborators,
    rowsCount,
    timeIntervals,
    startHour,
    displayHeight,
    meetingId,
    readonly,
    setSelectedUsers,
    globalTimeline,
}: IMeetingGrid) {
    const columnCount = potentialMeetings.length;

    // This is the most important part of the code. It creates a 2D array of TimeBlocks that basically represents the entire grid.
    // the whole code depends on this array.
    const meetingArray: TimeBlock[][] = createMeetingArray(
        rowsCount,
        columnCount,
        potentialMeetings,
        startHour,
        timeIntervals
    );
    rowsCount = meetingArray[0].length;
    // reassinging rowsCount in case of daylight savings extended hours

    const [fromColumn, setFromColumn] = useState(-1);
    const [fromRow, setFromRow] = useState(-1);
    const [toColumn, setToColumn] = useState(-1);
    const [toRow, setToRow] = useState(-1);
    const [value, setValue] = useState(false);
    const [isSelectMode, setIsSelectMode] = useState(false);

    const [actualGrid, setActualGrid] = useState(
        Array.from({ length: rowsCount }, () =>
            Array.from({ length: meetingArray.length }, () => false)
        )
    );

    const [globalGrid, setGlobalGrid] = useState(
        Array.from({ length: rowsCount }, () =>
            Array.from({ length: meetingArray.length }, () => 0)
        )
    );

    /*
     * The following is temporary code that will replaced later by the /api directory.
     */

    // Grid of a list of user ids that are in that time block
    const [usersAmtGrid, setUsersAmtGrid] = useState<string[][][]>(
        Array.from({ length: rowsCount }, () =>
            Array.from({ length: meetingArray.length }, () => [])
        )
    );
    useEffect(() => {
        constructGlobalMeetingGrid();
    }, [globalTimeline]);

    const constructGlobalMeetingGrid = async () => {
        let res = globalTimeline;
        let tempGrid: string[][][] = Array.from({ length: rowsCount }, () =>
                Array.from({ length: meetingArray.length }, () => [])
            );

            for (
                let userIndex: number = 0;
                userIndex < res.users.length;
                userIndex++
            ) {
                const user: UserTimes = res.users[userIndex];
                const userGrid: boolean[][] = getGridFromBlocks(
                    user.times,
                    meetingArray
                );
                for (let r: number = 0; r < rowsCount; r++) {
                    for (let c: number = 0; c < columnCount; c++) {
                        if (userGrid[r][c]) {
                            tempGrid[r][c].push(user._id);
                        }
                    }
                }
            }
            setUsersAmtGrid(tempGrid);
        
    };
    useEffect(() => {
        constructGlobalMeetingGrid();
        loadTimeline();
    }, []);

    const [timeline, setTimeline] = useState<TimeBlock[]>([]);
    const loadTimeline = async () => {
        let data = await fetch(
            `${process.env.API_URL}/cal/${meetingId}/meetme/me`,
            {
                credentials: "include",
                body: JSON.stringify({
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Data coud not be fetched!");
                }
                return response;
            })
            .then((res) => res.json());
        console.log({ data });
        if (data.timeline[0].timeline.length == 0) {
            data.timeline[0].timeline.push({ _id: getUser().uid, times: [] });
        }
        console.log({ timeline: data.timeline[0] });
        setTimeline(data.timeline[0].timeline[0].times);
        let grid = getGridFromBlocks(
            data.timeline[0].timeline[0].times,
            meetingArray
        );
        setActualGrid(grid);
        return data;
    };

    /*
     * End of temporary code
     */

    function selectFromHere(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();

        if (readonly) {
            return;
        }

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

        setValue(!actualGrid[row][column]);

        setIsSelectMode(true);
    }
    function stopSelection() {
        if (
            fromColumn == -1 ||
            toColumn == -1 ||
            fromRow == -1 ||
            toRow == -1
        ) {
            return;
        }
        if (readonly) {
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

        let newTimeLine: TimeBlock[] = [];

        if (!actualGrid[fromRow][fromColumn]) {
            // Removing timeblocks
            newTimeLine = getRemovedTimeline(timeline, times);
        } else {
            // Adding timeblocks
            newTimeLine = getSortedMergedTimeblocks(timeline, times);
        }
        setTimeline(newTimeLine);

        fetch(`${process.env.API_URL}/cal/${meetingId}/me`, {
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
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            });

        /* End Selection Mode */
        setIsSelectMode(false);
        setActualGrid(displayGrid);
    }
    function selectToHere(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();

        if (readonly) {
            return;
        }

        const column: number = parseInt(
            event.currentTarget.getAttribute("data-col")
        );
        const row: number = parseInt(
            event.currentTarget.getAttribute("data-row")
        );

        setToColumn(column);
        setToRow(row);

        stopSelection();
    }

    function updateDisplayGrid(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();

        if (!isSelectMode) {
            return;
        }

        const column: number = parseInt(
            event.currentTarget.getAttribute("data-col")
        );
        const row: number = parseInt(
            event.currentTarget.getAttribute("data-row")
        );

        setToColumn(column);
        setToRow(row);
    }

    /*
     * This code exists to fix the edgecase when the user selects
     * the timeblocks from topright to bottomleft, bottomright to topleft,
     * etc.
     *
     * Without this, users can only bulk select by
     * going topleft to bottomright
     */
    const topLeftCornerRow = Math.min(fromRow, toRow);
    const topLeftCornerColumn = Math.min(fromColumn, toColumn);

    const bottomRightCornerRow = Math.max(fromRow, toRow);
    const bottomRightCornerColumn = Math.max(fromColumn, toColumn);

    /* This might seem scuffed, but this is a deepcopy. */
    let selectionGrid: boolean[][] = JSON.parse(JSON.stringify(actualGrid));
    let displayGrid: boolean[][] = JSON.parse(JSON.stringify(actualGrid));

    /*
     * Used to detect if the user has released their mouse outside of
     * the viewport or the MeetingGrid component itself.
     */
    document.onmouseup = stopSelection;

    return (
        <div className="rounded-md bg-white w-full min-h-28 overflow-hidden">
            <div className="flex">
                {potentialMeetings.map((x, i) => (
                    <MeetingColumnHeader
                        month={x.getMonth()}
                        day={x.getDate()}
                        year={x.getFullYear()}
                        totalColumns={columnCount}
                        key={i}
                    />
                ))}
            </div>
            <div className="flex">
                {meetingArray.map((day, c) => (
                    <div style={{ width: `${100 / columnCount}%` }} key={c}>
                        {day.map((timeBlock, r) => {
                            if (
                                topLeftCornerColumn <= c &&
                                c <= bottomRightCornerColumn &&
                                topLeftCornerRow <= r &&
                                r <= bottomRightCornerRow
                            ) {
                                selectionGrid[r][c] = value;
                            }

                            displayGrid[r][c] = selectionGrid[r][c];
                            potentialMeetings[c].setHours(startHour.getHours());

                            const blockReadOnly: boolean =
                                timeBlock.start == null;
                            return (
                                <MeetingBlock
                                    displayHeight={displayHeight}
                                    selectFromHere={selectFromHere}
                                    selectToHere={selectToHere}
                                    updateDisplayGrid={updateDisplayGrid}
                                    column={c}
                                    row={r}
                                    start={timeBlock.start}
                                    end={timeBlock.end}
                                    selectedLevel={
                                        readonly
                                            ? usersAmtGrid[r][c].length
                                            : displayGrid[r][c]
                                            ? collaborators.length
                                            : 0
                                    }
                                    collaborators={collaborators}
                                    selectedUsers={usersAmtGrid[r][c]}
                                    key={c * rowsCount + r}
                                    readonly={blockReadOnly}
                                    setSelectedUsers={setSelectedUsers}
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
