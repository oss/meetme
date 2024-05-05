import Tile from '../../../components/tile'
import calendarMaindataStore from '../../../store/calendarMaindata'
function MeetingTimeTile({ calID }) {
    const [start, end] = calendarMaindataStore((store) => [store.calendarData[calID].data.meetingTime.start,store.calendarData[calID].data.meetingTime.end])

    const getTextValue = () => {
        if(start === null || end === null )
            return ('Meeting time has not been set.') 
    }
    return (
        <Tile>
            <div className='bg-white'>
                <Tile.Title>
                    Meeting Time
                </Tile.Title>
                <p>
                    {getTextValue()}
                </p>

            </div>
        </Tile>

    );
}

export default MeetingTimeTile