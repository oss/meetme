import userStore from '@store/userStore';
import metadataStore from '@store/calendarMetadata';
import orgDataStore from '@store/orgData';
import { memo, useEffect } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import LoadingCalendarTile from './calendar/loadingTile';
import CalendarTile from './calendar/meetingTile';
import DropDownMenu from './calendar/dropDownMenu';
import OrgTile from './organizations/orgTile';
import LoadingOrgTile from './organizations/loadingTile';
import Stack from '@primitives/stack'

function CalendarTileCreator({ calendarID, idx }) {
    const calendarInStore = metadataStore((store) => calendarID in store.calendarMetadata)
    const [calendarMetadata, addCalendar] = metadataStore((store) => [store.calendarMetadata[calendarID], store.addCalendar,store.listenForUpdates])
    
    if (calendarInStore === false) {
        addCalendar(calendarID)
        return <LoadingCalendarTile calendarID={calendarID} />
    }
    if (calendarMetadata.isLoaded === false)
        return <LoadingCalendarTile calendarID={calendarID} />

    return <CalendarTile calendarID={calendarID} />
}

const HeaderButton = memo(function HeaderButton() {
    return (
        <TabList className="my-2 w-fit flex gap-x-3 rounded-xl bg-white p-2">
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
        </TabList>
    );
})

function OrgTileCreator({ orgID }) {
    const orgInStore = orgDataStore((store) => orgID in store.orgData)
    const [orgData, addOrg] = orgDataStore((store) => [store.orgData[orgID], store.addOrg])

    if (orgInStore === false) {
        addOrg(orgID)
        return <LoadingOrgTile orgID={orgID} />
    }

    if (orgData.isLoaded === false)
        return <LoadingOrgTile orgID={orgID} />

    console.log(orgData)
    return <OrgTile orgID={orgID} orgName={orgData.data.name} />
}

function OrgPanel() {
    const orgList = userStore((store) => store.organizations)
    return (
        <TabPanel>
            <ul className='flex flex-wrap'>
                {orgList.map((org, idx) => {
                    return (
                        <li key={idx} className='w-full md:w-1/3'>
                            <OrgTileCreator orgID={org._id} />
                        </li>
                    )
                })}
            </ul>
        </TabPanel>
    )
}

const TileLayer = function TileLayer() {
    const calendarList = userStore((store) => store.calendars.toReversed());

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
    const calendarList = userStore((store) => store.calendars.toReversed());

    return (
        calendarList.map((cal, idx) =>
            <li key={idx} className='relative w-full md:w-1/3 group'>
                <div className='invisible'>
                    <CalendarTileCreator calendarID={cal._id} idx={idx} />
                </div>
                <div className='absolute top-0 right-0'>
                    <DropDownMenu calID={cal._id} idx={idx} />
                </div>
            </li>
        ));
}

function CalendarPanel() {
    return (
        <TabPanel>
            <Stack>
                <Stack.Item>
                    <ul className='relative flex flex-wrap'>
                        <TileLayer />
                    </ul>
                </Stack.Item>
                <Stack.Item>
                    <ul className='relative flex flex-wrap pointer-events-none'>
                        <MenuLayer />
                    </ul>
                </Stack.Item>
            </Stack>
        </TabPanel >
    );
}


function Dashboard() {
    return (
        <div className="py-3 px-10 w-full h-full bg-gray-100 border border-gray-200">
            <TabGroup>
                <HeaderButton />
                <TabPanels>
                    <CalendarPanel />
                    <OrgPanel />
                </TabPanels>
            </TabGroup>
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