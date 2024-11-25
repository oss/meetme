import MeetingColumnHeader from "../common/meeting-column-header";
import MeetingBlock from "./meeting-block";
import {
    getGridFromBlocks,
    createMeetingArray,
    UserTimes,
} from "../utilities";

import calendarMaindataStore from '@store/calendarMaindata';
import googleStore from '@store/googleStore';
import { hoveredUsersStore } from './state.js';
import calendarPageStore from '../../store.js';

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
    const setHoveredUsers = hoveredUsersStore((store) => store.setHoveredUsers)
    const displayHeight: number = 0.9;

    const columnCount = calendarMaindataStore((store) => {
        return store.calendarData[calID].data.blocks.length
    });

    const globalTimeline = calendarMaindataStore((store) => {
        return store.calendarData[calID].data.users
    })

    const userTimes = googleStore((store) => store.googleData[calID].data)
    //const userTimes = googleStore((store) => store.googleCal)

    console.log("MEETING")
    console.log(userTimes)

    const validTimes = calendarMaindataStore((store) => store.calendarData[calID].data.blocks)
    const potentialMeetings = validTimes.map(
        (object: any, i: number) => {
            const date = new Date(object.start);
            return date;
        }
    )

    const timeIntervals: number = 10;

    const startHour = calendarMaindataStore((store) => store.calendarData[calID].data.blocks[0].start)
    const endHour = calendarMaindataStore((store) => store.calendarData[calID].data.blocks[0].end)

    // This is the most important part of the code. It creates a 2D array of TimeBlocks that basically represents the entire grid.
    // the whole code depends on this array.
    const meetingArray: TimeBlock[][] = createMeetingArray(
        rowsCount,
        columnCount,
        potentialMeetings,
        new Date(startHour),
        timeIntervals
    );

    const allMembers = calendarPageStore((store)=>store.memberSet)

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

    return (
        <div>
            <ol className="bg-gray-200 rounded-tl-lg flex">
                    {potentialMeetings.map((x, i) => (
                        <li style={{ width: `${100 / columnCount}%` }}>
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
                                    setSelectedUsers={setHoveredUsers}
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
