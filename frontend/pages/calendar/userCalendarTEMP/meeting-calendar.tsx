import MeetingLabels from "./meeting-labels";
import mainDataStore from '../../../store/calendarMaindata.js';
import Tile from '../../../components/tile';
import MeetingGrid from "./meeting-grid";

function MeetingCalendar({ calID }) {
    const timeIntervals: number = 10;
    const blockHeight: number = 0.9;

    const [startHour, endHour] = mainDataStore((store) => {
        const allowedTimes = store.calendarData[calID].data.blocks;

        return [
            new Date(allowedTimes[0].start),
            new Date(allowedTimes[0].end)
        ]
    })

    const rowsCount: number = Math.ceil((endHour - startHour) / (60 * 1000 * timeIntervals));

    return (
        <Tile>
            <div className="bg-white">
                <MeetingLabels
                    displayHeight={blockHeight}
                    rowsCount={rowsCount}
                    startHour={new Date(startHour)}
                    timeIntervals={timeIntervals}
                />
                <div>
                    <MeetingGrid calID={calID} rowsCount={rowsCount}/>
                </div>

            </div>
        </Tile>
    );
}

export default MeetingCalendar;
