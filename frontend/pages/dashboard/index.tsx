import userStore from '@store/userStore';
import metadataStore from '@store/calendarMetadata';
import googleStore from '@store/googleStore';
import orgDataStore from '@store/orgData';
import filterStore from '@store/filterStore';
import { memo, useEffect } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import LoadingCalendarTile from './calendar/loadingTile';
import CalendarTile from './calendar/meetingTile';
import DropDownMenu from './calendar/dropDownMenu';
import FilterDropDown from './calendar/filterDropDown';
import SearchBar from './calendar/searchBar'
import OrgTile from './organizations/orgTile';
import LoadingOrgTile from './organizations/loadingTile';
import Stack from '@primitives/stack';
import { hoveredTileStore } from './store.js'

function CalendarTileCreator({ calendarID, idx }) {
    const calendarInStore = metadataStore((store) => calendarID in store.calendarMetadata)
    const calendarMetadata = metadataStore((store) => store.calendarMetadata[calendarID])
    const addCalendar = metadataStore((store)=> store.addCalendar)

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
                        ${selected ? "bg-rutgers_red shadow text-white" : "text-rutgers_red hover:shadow-md hover:bg-slate-100"}`
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
    const orgData = orgDataStore((store) => store.orgData[orgID])
    const addOrg = orgDataStore((store) => store.addOrg)

    if (orgInStore === false) {
        addOrg(orgID)
        return <LoadingOrgTile orgID={orgID} />
    }

    if (orgData.isLoaded === false)
        return <LoadingOrgTile orgID={orgID} />

    //console.log(orgData)
    return <OrgTile orgID={orgID} orgName={orgData.data.name} />
}

function SortMethod(filter, ascending){
    if (filter === "Name" && ascending === false){
        return (function (a, b) {return ('' + a.data.name).localeCompare(b.data.name)})
    }
    else if (filter === "Name" && ascending === true){
        return (function (b, a) {return ('' + a.data.name).localeCompare(b.data.name)})
    }
    else if (filter === "Time Created" && ascending === false){
        return (function (a, b) {return a.data.created < b.data.created})
    }
    else if (filter === "Time Created" && ascending === true){
        return (function (b, a) {return a.data.created < b.data.created})
    }
    else if (filter === "Time Modified" && ascending === false){
        return (function (a, b) {return a.data.modified < b.data.modified})
    }
    else if (filter === "Time Modified" && ascending === true){
        return (function (b, a) {return a.data.modified < b.data.modified})
    }
    else if (filter === "Meeting Time" && ascending === false){
        return (function (a, b) {return a.data.meetingTime.start < b.data.meetingTime.start})
    }
    else if (filter === "Meeting Time" && ascending === true){
        return (function (b, a) {return a.data.meetingTime.start < b.data.meetingTime.start})
    }
    else{
        return (function (a, b) {return ('' + a.data._id).localeCompare(b.data._id)})
    }

}

function OrgPanel() {
    const orgList = userStore((store) => store.organizations);

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
    const calendarList = userStore((store) => store.calendars);

    return (
        calendarList.map((cal, idx) => {
            return (
                <li key={idx} className='h-fit m-1 w-full md:w-[30%] group/meeting-tile'>
                    <CalendarTileCreator calendarID={cal._id} idx={idx} />
                </li>
            )
        })
    )
}

function MenuLayer() {
    const calendarList = userStore((store) => store.calendars);

    return (
        calendarList.map((cal, idx) =>
            <li key={idx} className='relative h-fit m-1 w-full md:w-[30%]'>
                <div className='invisible'>
                    <CalendarTileCreator calendarID={cal._id} idx={idx} />
                </div>
                <div className='absolute top-0 right-0 p-2'>
                    <DropDownMenu calID={cal._id} idx={idx} />
                </div>
            </li>
        ));
}

function CalendarPanel() {
    const hoveredTileListRef = hoveredTileStore((store)=>store.hoveredTileListRef)

    return (
        <TabPanel>
            <Stack>
                <Stack.Item>
                    <ul className='relative flex flex-wrap' ref={hoveredTileListRef} >
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

async function USECODE(){


    let data2 = await fetch(`${process.env.API_URL}/user/google_tokens`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code:"4/0AeanS0YReccHtwcsuzoU6-7A6dbL02ZVigfDKCzxtMufc9Zk5KdslneEFAtHm9dQkb7dcg",
        }),
    }).then((res) => res.json());

    console.log(data2)

    return data2;
}

async function getLink(){
    let data2 = await fetch(`${process.env.API_URL}/user/google_auth_link`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());
    console.log(data2)
    return data2
}



async function getDates(){
    const time = new Date().toISOString()
    const time2 = new Date(Date.now() + 48 * (60 * 60 * 1000) ).toISOString()

    let data2 = await fetch(`${process.env.API_URL}/user/google_cal_dates`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            minTime:time,
            maxTime:time2,
        }),
    }).then((res) => res.json());

    console.log(data2)

    const googlestartend = data2.data.items.map((object: any, i: number) => {
        const startDate = new Date(object.start.dateTime).valueOf();
        const endDate = new Date(object.start.dateTime).valueOf();
        return {start: startDate,  end: endDate};
    })

    console.log(googlestartend)

    const googleCals = {_id: "primary", times:googlestartend}

    console.log(googleCals)

    return googleCals;
}



async function getRemove(){
    let data2 = await fetch(`${process.env.API_URL}/user/google_remove`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());


    console.log(data2)
    return data2;
}



function Dashboard() {
    const setSelectedIndex = filterStore((store) => store.setSelectedIndex);
    const googleEmail = googleStore((store) => store.googleEmail);
    const fetchGoogleEmail = googleStore((store) => store.fetchGoogleEmail);
    const addGoogleCalendar = googleStore((store) => store.addGoogleCalendar);
    const setGoogleCal = googleStore((store) => store.setGoogleCal);

    useEffect( ()=>{
        fetchGoogleEmail()
        setGoogleCal()
        addGoogleCalendar("6uetvqHgDScEm8_82CLy5D-L1qyoKwxzev1t1UKvv606Eef6Zmx-yqw_Fqr2-JlISwvQHXd2j74rhce4USpb4Q") 
    },[])


    return (
        <div className="py-3 px-10 w-full h-full bg-gray-100 border border-gray-200">
            <button
                className="bg-rutgers_red hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2"
                onClick={() =>  getLink()}
            >
                Link
            </button>
            <button
                className="bg-rutgers_red hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2"
                onClick={() =>  getDates()}
            >
                DATES
            </button>
            <button
                className={`${googleEmail?"bg-green-500":"bg-rutgers_red"} hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2`}
                onClick={() =>  getRemove()}
            >
                Status
            </button>
            <TabGroup onChange = {setSelectedIndex} className= "flex flex-wrap">
                <HeaderButton />
                <div className = "w-full"></div>
                <TabPanels className = "w-full">
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
