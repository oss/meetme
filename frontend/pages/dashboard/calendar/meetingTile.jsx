import { memo, useEffect } from "react";
import { buttonMenuBridge } from "./state";
import Tile from '@primitives/tile';
import { Link } from "react-router-dom";
import calendarMetadata from "@store/calendarMetadata";

const calendarTile = ({ calendarID }) => {
    const [startListeningToUpdates, stopListeningToUpdates] = calendarMetadata((store)=>[store.listenForUpdates, store.stopListenForUpdates])
    const [calendarName, calendarOwner] = calendarMetadata((store) => [
        store.calendarMetadata[calendarID].data.name, 
        store.calendarMetadata[calendarID].data.owner._id, 
    ])

    useEffect(()=>{
        startListeningToUpdates(calendarID)
        return ()=>{
            stopListeningToUpdates(calendarID)
        }
    },[])

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
                        <p className="text-xs overflow-hidden text-slate-500/50 overflow-ellipsis border-r-8 border-transparent">
                            {calendarID}
                        </p>
                    </div>
                </div>
            </Link>
        </Tile>
    )
}

export default calendarTile;