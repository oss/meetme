import Tile from "../../../components/tile";
import calendarMetadata from '../../../store/calendarMetadata'

function CalendarNameTile({ calID }) {
    const calendarName = calendarMetadata((store) => store.calendarMetadata[calID].data.name)
    return (
        <Tile>
            <div className='bg-white'>
                <Tile.Body>
                    <Tile.Title>Name</Tile.Title>
                    {calendarName}
                </Tile.Body>
            </div>
        </Tile>

    )
}

export default CalendarNameTile;