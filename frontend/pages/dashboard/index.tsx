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

async function newaccess(){
    let data2 = await fetch(`${process.env.API_URL}/user/google_info`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());

    console.log(data2)

    let data = await fetch(`https://oauth2.googleapis.com/token`, {
        method: "POST",
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id:"35553104132-c9sos4lv16atkakg7t6nuoi9amktickk.apps.googleusercontent.com",
            client_secret:"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",
            refresh_token:data2.refresh_token,
            grant_type:"refresh_token"
        }),
    }).then((res) => res.json());

    const timeObject = new Date(Date.now() + data.expires_in * 1000);

    console.log(timeObject)

    let data3 = await fetch(`${process.env.API_URL}/user/google_tokens`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            access_token:data.access_token,
            refresh_token:data2.refresh_token,
            expires: timeObject.valueOf(),
        }),
    }).then((res) => res.json());
    console.log(data3)
    return data
}

async function getDates(){
    let data2 = await fetch(`${process.env.API_URL}/user/google_info`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());


    let data = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=` + data2.access_token, {
        method: "GET",
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());

    console.log(data)
    return data;
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
    const googleVerified = googleStore((store) => store.googleVerified);
    const fetchGoogleVerified = googleStore((store) => store.fetchGoogleVerified);

    useEffect(()=>{
        fetchGoogleVerified()
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
                onClick={() =>  USECODE()}
            >
                USECODE
            </button>
            <button
                className="bg-rutgers_red hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2"
                onClick={() =>  newaccess()}
            >
                newaccess
            </button>
            <button
                className="bg-rutgers_red hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2"
                onClick={() =>  getDates()}
            >
                DATES
            </button>
            <button
                className={`${googleVerified?"bg-green-500":"bg-rutgers_red"} hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2`}
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
