import Tile from "../../../components/tile";

function CalendarNameTile({ calendarName }) {
    return (
        <Tile>
            <div className='bg-white'>
                <Tile.Title>Name</Tile.Title>
                {calendarName}
            </div>
        </Tile>

    )
}

export default CalendarNameTile;