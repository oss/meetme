import userStore from '../store/userStore';
import metadataStore from '../store/dashboard/calendarMetadata';
import dialogueStore from '../store/dialogueStore';
import { Fragment, useEffect, useId } from 'react';
import { Dialog, Menu, Tab, Transition } from '@headlessui/react';
import Tile from '../components/tile';
import { Link } from 'react-router-dom';
import RedButton from '../components/utils/red-button';
import { useState, useRef } from 'react';


function Dashboard() {
    const calendarMetadata = metadataStore((store) => store)
    const [dialogueHook, closeDialogue] = dialogueStore((store) => [store.setPanel, store.closePanel])

    useEffect(() => {
        calendarMetadata.functions.keepUpdated()
        return () => {
            calendarMetadata.functions.stopUpdated()
        }
    }, [])

    function TextBarDialogue({ buttonText, titleText, onClickPassthrough, displayError, errorMessage = '', placeholder = '', description = '' }) {
        const [textBarValue, setTextBarValue] = useState(placeholder);

        return (
            <>
                <Dialog.Title>{titleText}</Dialog.Title>
                <Dialog.Description>
                    <p className="text-sm text-gray-500">
                        {description}
                    </p>
                </Dialog.Description>
                <div className='h-1' />
                <input type="text" className="
                        w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                        focus:border-sky-500 focus:ring-1 focus:ring-sky-500" placeholder={placeholder} onChange={(e) => { setTextBarValue(e.target.value) }} />
                <div className='h-1' />
                <div className='inline-flex w-full'>
                    <p className="grow min-w-5 text-xs text-rose-600 inline text-clip break-words">
                        {displayError ? errorMessage : <></>}
                    </p>
                    <div className=''>
                        <RedButton onClick={() => {
                            onClickPassthrough({ textBarValue });
                        }}>
                            {buttonText}
                        </RedButton>
                    </div>
                </div>
            </>
        )
    }

    function RenameDialogue({ cal_id }) {
        const [displayError, setDisplayError] = useState(false)
        const [errorMessage, setErrorMessage] = useState('some error message')

        return (
            <TextBarDialogue
                buttonText='Rename'
                titleText='Rename Calendar'
                placeholder='untitled'
                displayError={displayError}
                errorMessage={errorMessage}
                onClickPassthrough={async ({ textBarValue }) => {
                    const req = await fetch(`${process.env.API_URL}/cal/${cal_id}/name`, {
                        credentials: 'include', method: 'PATCH', headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ new_name: textBarValue })
                    });
                    const resp = await req.json()
                    if (resp.Status === 'ok') {
                        closeDialogue()
                    }
                    else {
                        setErrorMessage(resp.error)
                        setDisplayError(true)
                    }
                }} />
        )
    }

    function DeleteDialogue({ cal_id }) {
        const [displayError, setDisplayError] = useState(false)
        const [errorMessage, setErrorMessage] = useState('some error message')
        const confirmationString = Math.random().toString(36).slice(2)

        return (
            <TextBarDialogue
                buttonText='Delete'
                titleText='Delete Calendar'
                description={`Type in the phrase ${confirmationString} to delete`}
                displayError={displayError}
                errorMessage={errorMessage}
                onClickPassthrough={async ({ textBarValue }) => {
                    if (textBarValue !== confirmationString) {
                        setErrorMessage('Confirmation code incorrect')
                        setDisplayError(true)
                        return
                    }

                    const req = await fetch(`${process.env.API_URL}/cal/${cal_id}`, {
                        credentials: 'include', method: 'DELETE', headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const resp = await req.json()
                    if (resp.Status === 'ok') {
                        closeDialogue()
                    }
                    else {
                        setErrorMessage(resp.error)
                        setDisplayError(true)
                    }
                }} />

        )
    }

    function HeaderButton() {
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
                <div className='group'>
                    <Tile>
                        <Link to={`/cal/${cal._id}`}>
                            <div className='bg-white grow'>
                                <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                                    <p className="text-x font-semibold break-words" >
                                        <wbr />
                                        {cal.data.name}
                                    </p>
                                    <p className="text-sm font-medium break-words text-slate-500/50">
                                        {cal.data.owner._id}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </Tile>
                </div>
            )
        return (
            <div className='group'>
                <Tile>
                    <Link to={"/cal/" + cal._id}>
                        <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                            loading...
                        </div>
                    </Link>
                </Tile>
            </div>
        )
    }

    function CalendarPanel() {
        const [openMenuIdx, setMenuIdx] = useState(-1);

        return (
            <Tab.Panel>
                <div className='grid grid-cols-1 grid-rows-1'>
                    <ul className='flex flex-wrap' style={{ gridColumn: 1, gridRow: 1 }}>
                        {calendarMetadata.calendarMetadata.map((cal,idx) =>
                            <li key={idx} className='w-full md:w-1/3'>
                                <MeetingTileBody cal={cal} />
                            </li>
                        )}
                    </ul>
                    <ul className='flex flex-wrap pointer-events-none' style={{ gridColumn: 1, gridRow: 1 }}>
                        {calendarMetadata.calendarMetadata.map((cal, idx) =>
                            <li key={idx} className='relative w-full md:w-1/3'>
                                <div className='invisible'>
                                    <MeetingTileBody cal={cal} />
                                </div>
                                <Menu as="div" className='pointer-events-auto absolute top-0 right-0'>
                                    {({ open }) => {
                                        if(open === false && idx === openMenuIdx){
                                            setMenuIdx(-1)
                                        }
                                        return (
                                            <Menu.Button onClick={() => {
                                                console.log(open)
                                                if (open)
                                                    setMenuIdx(-1)
                                                else
                                                    setMenuIdx(idx)
                                            }}>
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
                                        )
                                    }}
                                </Menu>
                            </li>
                        )}
                    </ul>
                    <ul className='flex flex-wrap pointer-events-none' style={{ gridColumn: 1, gridRow: 1 }}>
                        {calendarMetadata.calendarMetadata.map((cal, idx) =>
                            <li key={idx} className='relative w-full md:w-1/3 group'>
                                <div className='invisible'>
                                    <MeetingTileBody cal={cal} />
                                </div>
                                <div className='absolute top-0 right-0'>
                                    <Menu as="div">
                                        <Menu.Button className='invisible'>
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
                                        <Transition
                                            as={Fragment}
                                            show={idx === openMenuIdx}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="pointer-events-auto absolute w-20 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none -right-5">
                                                <div className="px-1 py-1">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                className={`${active ? 'bg-red-400 text-white' : 'text-gray-900'
                                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                                onClick={() => {
                                                                    dialogueHook(<RenameDialogue cal_id={cal._id} />)
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
                                                                    dialogueHook(<DeleteDialogue cal_id={cal._id} />)
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
                            </li>
                        )}
                    </ul>
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