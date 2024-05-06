import MeetingColumnHeader from "./meeting-column-header";
import MeetingBlock from "./meeting-block";
import {
    getGridFromBlocks,
    createMeetingArray,
    UserTimes,
} from "./utilities";

import calendarMaindataStore from '../../../store/calendarMaindata';

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
        const arr = Array.from({ length: rowsCount }, () =>
            Array.from({ length: meetingArray.length }, () => [])
        );

        for (let userIndex: number = 0; userIndex < userTimes.length; userIndex++) {
            const user: UserTimes = userTimes[userIndex];

            const userGrid: boolean[][] = getGridFromBlocks(
                user.times,
                meetingArray
            );

            for (let r: number = 0; r < rowsCount; r++) {
                for (let c: number = 0; c < columnCount; c++) {
                    if (userGrid[r][c]) {
                        arr[r][c].push(user._id);
                    }
                }
            }
        }
        return arr;
    })()

    console.log(meetingArray)


    return (
        <>
            <ol className="bg-gray-200 rounded-tl-lg">
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
            <div className="flex">
                {meetingArray.map((day, c) => (
                    <div style={{ width: `${100 / columnCount}%` }} key={c}>
                        {day.map((timeBlock, r) => {
                            return (
                                <MeetingBlock
                                    displayHeight={displayHeight}
                                    column={c}
                                    row={r}
                                    start={timeBlock.start}
                                    end={timeBlock.end}
                                    collaborators={allMembers}
                                    selectedUsers={usersAmtGrid[r][c]}
                                    key={c * rowsCount + r}
                                    onSelectUsers={(userArr) => { console.log(userArr) }}
                                    disabled={timeBlock.start === null || timeBlock.end === null}
                                    setSelectedUsers={(x) => { console.log('this outputs hovered netids as an array', x) }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </>
    );
}

export default MeetingGrid;