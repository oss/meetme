import { memo } from "react";
import { buttonMenuBridge } from "./state";
import Tile from '../../../components/tile';
import { Link } from "react-router-dom";
import { Menu } from "@headlessui/react";

const calendarTile = memo(({ calendarID, calendarName, calendarOwner, idx }) => {

    const setOpenMenuIdx = buttonMenuBridge((store) => store.setOpenMenuIdx)

    return (
        <div className='group relative'>
            <Tile>
                <Link to={`/cal/${calendarID}`} >
                    <div className='bg-white grow'>
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
                <Menu as="div" className='absolute top-0 right-0'>
                    <Menu.Button
                        onClick={() => {
                            setOpenMenuIdx(idx)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter')
                                setOpenMenuIdx(idx)
                        }}
                        className='pointer-events-auto'
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                        </svg>
                    </Menu.Button>
                </Menu>
            </Tile>
        </div>
    )
})

export default calendarTile;