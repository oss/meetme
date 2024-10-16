import { memo, useEffect } from "react";
import { buttonMenuBridge } from "./state";
import Tile from '@primitives/tile';
import { Link } from "react-router-dom";
import calendarMetadata from "@store/calendarMetadata";

const calendarTile = ({ calendarID }) => {
    const startListeningToUpdates = calendarMetadata((store)=>store.listenForUpdates)
    const stopListeningToUpdates = calendarMetadata((store)=>store.stopListenForUpdates)

    const calendarName = calendarMetadata((store) =>store.calendarMetadata[calendarID].data.name)
    const calendarOwner = calendarMetadata((store) =>store.calendarMetadata[calendarID].data.owner._id)
    const calendarLocation = calendarMetadata((store) =>store.calendarMetadata[calendarID].data.location)
    const calendarStart = calendarMetadata((store) =>store.calendarMetadata[calendarID].data.meetingTime.start)
    const calendarEnd = calendarMetadata((store) => store.calendarMetadata[calendarID].data.meetingTime.end)

    useEffect(()=>{
        startListeningToUpdates(calendarID)
        return ()=>{
            stopListeningToUpdates(calendarID)
        }
    },[])

    const pastTime = calendarEnd ? new Date(calendarEnd) <= new Date() : false ;

    return (
        <Tile>
            <Link to={`/cal/${calendarID}`} >
                <div className='bg-white grow group '>
                    <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-rutgers_red '>
                        <div className = {`w-full p-4 ${ pastTime ? "bg-slate-200" : "bg-white"} rounded cursor-pointer`}>
                            <p className="w-full mr-20 text-xl h-fit font-semibold break-words col-span-2" >
                                <wbr />
                                {calendarName}
                            </p>
                            <p className="w-full mr-20 text-sm h-fit font-medium break-words text-slate-500/50 col-span-2">
                                {calendarOwner}
                            </p>
                            {/* <p className="text-xs overflow-hidden text-nowrap text-slate-500/50 overflow-ellipsis border-r-8 border-transparent">
                                {calendarID}
                            </p> */}
                            <p className={" text-xs w-full mr-20 text-nowrap overflow-hidden break-words col-span-2 " + (calendarLocation == null ? "text-gray-300" : "text-slate-500/50 font-semibold")}>
                                {calendarLocation == null ? "-": calendarLocation}
                            </p>
                            <p className={" text-xs w-full mr-20 text-nowrap overflow-hidden break-words col-span-2 " + (pastTime ? "text-rutgers_red" : "text-slate-500/50")}>
                                {calendarStart == null ? "-": `Start: ${new Date(calendarStart).toLocaleString()} End: ${new Date(calendarEnd).toLocaleString()}`}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </Tile>
    )
}

export default calendarTile;
