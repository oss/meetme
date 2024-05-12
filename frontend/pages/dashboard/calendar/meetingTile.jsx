import { memo } from "react";
import { buttonMenuBridge } from "./state";
import Tile from '../../../components/tile';
import { Link } from "react-router-dom";

const calendarTile = memo(({ calendarID, calendarName, calendarOwner, idx }) => {

    return (
        <Tile>
            <Link to={`/cal/${calendarID}`} >
                <div className='bg-white grow group'>
                    <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                        <p className="text-x font-semibold break-words" >
                            <wbr />
                            {calendarName}
                        </p>
                        <p className="text-sm font-medium break-words text-slate-500/50">
                            {calendarOwner}
                        </p>

                    </div>
                </div>
            </Link>
        </Tile>
    )
})

export default calendarTile;