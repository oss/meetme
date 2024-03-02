import userStore from '../store/userStore';
import metadataStore from '../store/dashboard/calendarMetadata';
import dialogueStore from '../store/dialogueStore';
import { Fragment, useEffect, useId } from 'react';
import { Menu, Tab, Transition } from '@headlessui/react';
import Tile from '../components/tile';
import { idToAlphaNumeric } from '../lib/alphaNumericConversions';
import { Link } from 'react-router-dom';

function Dashboard() {
    const calendarMetadata = metadataStore((store) => store)
    const dialogueHook = dialogueStore((store) => store.setPanel)

    const id = useId();
    useEffect(() => {
        calendarMetadata.functions.keepUpdated()
        return () => {
            calendarMetadata.functions.stopUpdated()
        }
    }, [])

    function HeaderButton() {
        console.log('header')
        return (
            <Tab.List className="my-2 w-fit flex space-x-12 rounded-xl bg-white p-2">
                {['Calendars', 'Organizations'].map((category) =>
                    <Tab
                        key={category}
                        className={({ selected }) =>
                            `transition-all ease-linear duration-75 w-full rounded-lg p-2.5 text-base font-medium leading-5 text-red-700 outline-none
                            ${selected ? "bg-red-400 shadow text-white" : "text-red-300 hover:shadow-md"}`
                        }
                    >
                        {category}
                    </Tab>
                )}
            </Tab.List>
        );
    }

    function MeetingTileBody({ cal }) {
        if (cal.isLoaded)
            return (
                <div className='w-full md:w-[30%]'>
                    <div className='group'>
                        <Tile>
                            <Link to={"/cal/" + cal._id}>
                                <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                                    <p className="text-x font-semibold break-words" >
                                        {cal.data.name}
                                    </p>
                                    <p className="text-sm font-medium break-words text-slate-500/50">
                                        {cal.data.owner._id}
                                    </p>
                                </div>
                            </Link>
                        </Tile>
                    </div>
                </div>
            )
        return (
            <div className='w-full md:w-[30%]'>
                <div className='group'>
                    <Tile>
                        <Link to={"/cal/" + cal._id}>
                            <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                                loading...
                            </div>
                        </Link>
                    </Tile>
                </div>
            </div>
        )
    }

    function CalendarPanel() {
        return (
            <Tab.Panel>
                <div className='grid grid-cols-1 grid-rows-1'>
                    <div className='flex flex-wrap gap-y-2 gap-x-2' style={{ gridColumn: 1, gridRow: 1 }}>
                        {calendarMetadata.calendarMetadata.map((cal) =>
                            <MeetingTileBody cal={cal} />
                        )}
                    </div>
                    <div className='flex flex-wrap gap-y-2 gap-x-2 pointer-events-none' style={{ gridColumn: 1, gridRow: 1 }}>
                        {calendarMetadata.calendarMetadata.map((cal) =>
                            <div className='relative w-full md:w-[30%]'>
                                <div className='invisible'>
                                    <MeetingTileBody cal={cal} />
                                </div>
                                <Menu as="div" className='absolute top-0 right-0'>
                                    <Menu.Button>
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
                            </div>
                        )}
                    </div>
                    <div className='flex flex-wrap gap-y-2 gap-x-2 pointer-events-none' style={{ gridColumn: 1, gridRow: 1 }}>
                        {calendarMetadata.calendarMetadata.map((cal) =>
                            <div className='relative w-full md:w-[30%] group'>
                                <div className='invisible'>
                                    <MeetingTileBody cal={cal} />
                                </div>
                                <div className='absolute pointer-events-auto top-0 right-0'>
                                    <Menu as="div">
                                        <div>
                                            <Menu.Button>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="transparent"
                                                    className="w-4 h-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                                    />
                                                </svg>
                                            </Menu.Button>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute w-20 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none -right-5">
                                                <div className="px-1 py-1">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                className={`${active ? 'bg-red-400 text-white' : 'text-gray-900'
                                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                                onClick={() => {
                                                                    dialogueHook(<div>rename the calendar here</div>)
                                                                }}
                                                            >
                                                                Rename
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                className={`${active ? 'bg-red-400 text-white' : 'text-gray-900'
                                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                                onClick={() => {
                                                                    dialogueHook(<div>delete the calendar?</div>)
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                </div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Tab.Panel>
        );
    }

    function OrgPanel() {
        return (
            <Tab.Panel>
                OrgStuff
            </Tab.Panel>
        )
    }


    return (
        <div className="py-3 px-10 w-full h-full bg-gray-100 border border-gray-200">
            <Tab.Group>
                <HeaderButton />
                <Tab.Panels>
                    <CalendarPanel />
                    <OrgPanel />
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}

export default Dashboard;