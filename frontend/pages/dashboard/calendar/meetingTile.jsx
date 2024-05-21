import { memo, useEffect } from "react";
import { buttonMenuBridge } from "./state";
import Tile from '@primitives/tile';
import { Link } from "react-router-dom";
import calendarMetadata from "@store/calendarMetadata";

const calendarTile = ({ calendarID }) => {
    const [startListeningToUpdates, stopListeningToUpdates] = calendarMetadata((store)=>[store.listenForUpdates, store.stopListenForUpdates])
    const [calendarName, calendarOwner, calendarLocation] = calendarMetadata((store) => [
        store.calendarMetadata[calendarID].data.name, 
        store.calendarMetadata[calendarID].data.owner._id,
        store.calendarMetadata[calendarID].data.location,  
    ])

    useEffect(()=>{
        startListeningToUpdates(calendarID)
        return ()=>{
            stopListeningToUpdates(calendarID)
        }
    },[])

    return (
        <Tile 
            title={""} 
            default_margin={false}
            default_padding={"relative"}
            fullHeight={true}
>
            <Link to={`/cal/${calendarID}`} >
                <div className='bg-white grow group '>
                    <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600 '>
                        <div className = "w-full p-4 bg-white rounded cursor-pointer">
                        <p className="w-full mr-20 text-xl h-fit font-semibold break-words col-span-2" >
                            <wbr />
                            {calendarName}
                        </p>
                        <p className="w-full mr-20 text-sm h-fit font-medium break-words text-slate-500/50 col-span-2">
                            {calendarOwner}
                        </p>
                        <p className={"w-full mr-20 break-words col-span-2 " + (calendarLocation == null ? "text-gray-300" : "text-slate-500/50 font-semibold")}>
                            {calendarLocation == null ? "-": calendarLocation}
                        </p>

                        </div>

                    </div>
                </div>
            </Link>
        </Tile>
    )
}

export default calendarTile;