import MeetingLabels from "../common/meeting-labels";
import mainDataStore from '@store/calendarMaindata.js';
import MeetingGrid from "./meeting-grid";
import { useEffect } from "react";
import { useShallow } from 'zustand/shallow'

function MeetingCalendar({ calID }) {
    const timeIntervals: number = 10;
    const blockHeight: number = 0.9;

    const startHour = mainDataStore((store) => store.calendarData[calID].data.blocks[0].start)
    const endHour = mainDataStore((store) => store.calendarData[calID].data.blocks[0].end)

    const rowsCount: number = Math.ceil((endHour - startHour) / (60 * 1000 * timeIntervals)); //bad calculation, assumes 1 timeblock per day, can be multiple. this is scuffed

    const keepTimesUpdated = mainDataStore((store)=> store.listenForUpdates)
    const stopTimesUpdated = mainDataStore((store)=> store.stopListenForUpdates)

    useEffect(()=>{
        keepTimesUpdated(calID)
    },[])

    return (
        <div className="flex overflow-scroll">
            <div className="inline-block">
                <MeetingLabels
                    displayHeight={blockHeight}
                    rowsCount={rowsCount}
                    startHour={new Date(startHour)}
                    timeIntervals={timeIntervals}
                />
            </div>
            <div className="inline-block grow p-4 pt-0">
                <MeetingGrid calID={calID} rowsCount={rowsCount} />
            </div>
        </div>
    );
}

export default MeetingCalendar;
