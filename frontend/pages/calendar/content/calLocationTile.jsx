import Tile from "../../../components/tile";
import calendarMetadata from '../../../store/calendarMetadata'
function CalendarLocationTile({ calID }) {
    const location = calendarMetadata((store) => store.calendarMetadata[calID].data.location)
    return (
        <Tile>
            <div className='bg-white'>
                <Tile.Body>
                    <Tile.Title>Location</Tile.Title>
                    {location || 'No location has been set'}
                </Tile.Body>
            </div>
        </Tile>

    )
}

export default CalendarLocationTile;