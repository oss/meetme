import userStore from '../../store/userStore';
import metadataStore from '../../store/calendarMetadata';
import orgDataStore from '../../store/orgData';
import dialogueStore from '../../store/dialogueStore';
import { Fragment, memo, useEffect } from 'react';
import { Dialog, Menu, Tab, Transition } from '@headlessui/react';
import Tile from '../../components/tile';
import { Link } from 'react-router-dom';
import RedButton from '../../components/utils/red-button';
import { useState, useRef } from 'react';
import LoadingCalendarTile from './calendar/loadingTile';
import CalendarTile from './calendar/meetingTile';
import DropDownMenu from './calendar/dropDownMenu';


function CalendarTileCreator({ calendarID, idx }) {
    const calendarInStore = metadataStore((store) => calendarID in store.calendarMetadata)
    const [ calendarMetadata, addCalendar ] = metadataStore((store) => [ store.calendarMetadata[calendarID], store.addCalendar ])

    if (calendarInStore === false) {
        addCalendar(calendarID)
        return <LoadingCalendarTile calendarID={calendarID} />
    }
    if(calendarMetadata.isLoaded === false)
        return <LoadingCalendarTile calendarID={calendarID} />

    return <CalendarTile calendarID={calendarID} calendarName={calendarMetadata.data.name} calendarOwner={calendarMetadata.data.owner._id} idx={idx} />
}

function TextBarDialogue({ buttonText, titleText, onClickPassthrough, displayError, errorMessage = '', placeholder = '', description = '' }) {
    const textBarRef = useRef(null)

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
                    focus:border-sky-500 focus:ring-1 focus:ring-sky-500" placeholder={placeholder} ref={textBarRef} />
            <div className='h-1' />
            <div className='inline-flex w-full'>
                <p className="grow min-w-5 text-xs text-rose-600 inline text-clip break-words">
                    {displayError ? errorMessage : <></>}
                </p>
                <div className=''>
                    <RedButton onClick={onClickPassthrough({ textBarRef })}>
                        {buttonText}
                    </RedButton>
                </div>
            </div>
        </>
    )
}

const HeaderButton = memo(function HeaderButton() {
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
})

const LoadingOrgTile = memo(function LoadingTile({ orgID }) {
    return (
        <div className='group'>
            <Tile>
                <Link to={"/org/" + orgID}>
                    <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                        loading...
                    </div>
                </Link>
            </Tile>
        </div>
    )

})

function OrgTile({ orgID, orgName }) {
    return (
        <div className='group relative'>
            <Tile>
                <Link to={`/org/${orgID}`} >
                    <div className='bg-white grow'>
                        <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                            <p className="text-x font-semibold break-words" >
                                <wbr />
                                {orgName}
                            </p>
                        </div>
                    </div>
                </Link>
            </Tile>
        </div>
    )
}

function OrgPanel() {
    const orgList = userStore((store) => store.organizations)
    const [orgData, updateOrgJSON] = orgDataStore((store) => [store.orgData, store.updateOrgJSON])

    useEffect(() => {
        updateOrgJSON()
    }, [])

    return (
        <Tab.Panel>
            {orgList.map((org, idx) => {
                const orgJSON = orgData[org._id]
                if (orgJSON.isLoaded === false)
                    return <LoadingOrgTile orgID={org._id} />

                return <OrgTile orgID={org._id} orgName={orgJSON.data.name} />
            })}
        </Tab.Panel>
    )
}


/*
function DeleteDialogue({ cal_id }) {
    const closeDialogue = dialogueStore((store) => store.closePanel)

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
            onClickPassthrough={({ textBarValue }) => async (event) => {
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
*/

const TileLayer = function TileLayer() {
    const calendarList = userStore((store) => store.calendars)

    return (
        calendarList.map((cal, idx) => {
            return (
                <li key={idx} className='w-full md:w-1/3'>
                    <CalendarTileCreator calendarID={cal._id} idx={idx} />
                </li>
            )
        })
    )
}

function MenuLayer() {
    const calendarList = userStore((store) => store.calendars)

    return (
        calendarList.map((cal, idx) =>
            <li key={idx} className='relative w-full md:w-1/3 group'>
                <div className='invisible'>
                    <CalendarTileCreator cal={cal._id} idx={idx} />
                </div>
                <div className='absolute top-0 right-0'>
                    <DropDownMenu calID={cal._id} idx={idx}/>
                </div>
            </li>
        ));
}

function CalendarPanel() {
    return (
        <Tab.Panel>
            <div className='relative grid grid-cols-1 grid-rows-1'>
                <ul className='flex flex-wrap' style={{ gridColumn: 1, gridRow: 1 }}>
                    <TileLayer />
                </ul>
                <ul className='flex flex-wrap pointer-events-none' style={{ gridColumn: 1, gridRow: 1 }}>
                    <MenuLayer />
                </ul>
            </div>
        </Tab.Panel>
    );
}


function Dashboard() {
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
/*
    const innerRef = useRef(null);
    const fetchCalendarMetadata = metadataStore((store) => store.fetchCalendarMetadata)
    const IntersectionObserverCallback = (entries) =>{
        console.log(entries)
        const entry = entries[0]
        
        if(entry.isIntersecting)
            fetchCalendarMetadata(calendarID)
    }

    useEffect(()=>{
        const observer = new IntersectionObserver(IntersectionObserverCallback)
        observer.observe(innerRef.current)
        return () => {
            if(innerRef.current !== null)
                observer.unobserve(innerRef.current)
          }
    },[])

*/
export default Dashboard;