import Tile from '@primitives/tile';

import { Button } from '@headlessui/react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

import InviteDialogue from '@components/stateful/dialogues/inviteDialogue';
import RenameDialogue from '@components/stateful/dialogues/renameDialogue';
import LocationDialogue from '@components/stateful/dialogues/locationDialogue';
import MeetingTimeDialogue from '@components/stateful/dialogues/meetingTimeDialogue';

import GlobalCalendar from './calendarPanels/globalCalendar';
import UserCalendar from './calendarPanels/userCalendar';

import calendarMetadata from '@store/calendarMetadata';
import calendarMaindata from '@store/calendarMaindata';
import dialogueStore from '@store/dialogueStore';
import { hoveredUsersStore } from './calendarPanels/globalCalendar/state';
import memberListStore from './store';

function CalendarOwner({ calID }) {
    const setPanel = dialogueStore((store) => store.setPanel)
    const calendarName = calendarMetadata((store) => store.calendarMetadata[calID].data.name)
    const [start, end] = calendarMetadata((store) => [store.calendarMetadata[calID].data.meetingTime.start, store.calendarMetadata[calID].data.meetingTime.end])
    const location = calendarMetadata((store) => store.calendarMetadata[calID].data.location)
    const hoveredUsers = hoveredUsersStore((store) => store.hoveredUsers)

    const memberList = memberListStore((store)=>store.memberList)


    const MemberTileList = () => {
        return (
            <ul>
                {memberList.map((roleEntry, idx) =>
                    <li key={idx}>
                        <p className="font-bold text-xs text-slate-400/70">{roleEntry.role.toUpperCase()}</p>
                        <ul>
                            {roleEntry.IDs.map((netid, idx) =>
                                <li key={idx} className={`${hoveredUsers.has(netid) && 'bg-rutgers_red'}`}>
                                    {netid}
                                </li>
                            )}
                        </ul>
                    </li>
                )}
            </ul>
        )
    }

    const NameTile = () => {
        return (
            <Tile>
                <div className='bg-white'>
                    <Tile.Body>
                        <div className="flex justify-between items-center">
                            <Tile.Title>
                                Name
                            </Tile.Title>
                            <Button
                                className="px-1 ml-1 transition-all ease-linear rounded text-gray-600 hover:text-gray-400"
                                onClick={() => { setPanel(<RenameDialogue calID={calID} />) }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </Button>
                        </div>
                        {calendarName}
                    </Tile.Body>
                </div>
            </Tile>
        )
    }

    const CollaboratorTile = () => {
        return (
            <Tile>
                <div className='bg-white'>
                    <Tile.Body>
                        <div className="flex justify-between items-center">
                            <Tile.Title>
                                Meeting Collaborators
                            </Tile.Title>
                            <Button
                                className="px-1 ml-1 transition-all ease-linear rounded text-gray-600 hover:text-gray-400"
                                onClick={() => { setPanel(<InviteDialogue calID={calID} />) }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                </svg>
                            </Button>
                        </div>
                        <MemberTileList />
                    </Tile.Body>
                </div>
            </Tile>
        )
    }

    const FinalMeetingTile = () => {


        const getTextValue = () => {
            if (start === null || end === null)
                return ('Meeting time has not been set.')
            return `Start: ${new Date(start).toDateString() + " " + new Date(start).toTimeString().substring(0,8)} End: ${new Date(end).toDateString() + " " + new Date(end).toTimeString().substring(0,8)}`
        }

        return (
            <Tile>
                <div className='bg-white'>
                    <Tile.Body>
                        <div className="flex justify-between items-center">
                            <Tile.Title>
                                Meeting Time
                            </Tile.Title>
                            <Button
                                className="px-1 ml-1 transition-all ease-linear rounded text-gray-600 hover:text-gray-400"
                                onClick={() => {setPanel(<MeetingTimeDialogue calID={calID} />)}}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>

                            </Button>
                        </div>
                        <p>{getTextValue()}</p>
                    </Tile.Body>
                </div>
            </Tile>
        )
    }

    const LocationTile = () => {
        return (
            <Tile>
                <div className='bg-white'>
                    <Tile.Body>
                        <div className="flex justify-between items-center">
                            <Tile.Title>
                                Meeting Location
                            </Tile.Title>
                            <Button
                                className="px-1 ml-1 transition-all ease-linear rounded text-gray-600 hover:text-gray-400"
                                onClick={() => {setPanel(<LocationDialogue calID={calID} />) }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                            </Button>
                        </div>
                        {location|| 'No location set'}
                    </Tile.Body>
                </div>
            </Tile>
        )
    }

    /*
                <CalendarLocationTile calID={calID} />
            <CalendarMeetingTimeTile calID={calID} />

    */
    const tabClassString = 'rounded-full py-1 px-3 text-sm/6 font-semibold focus:outline-none data-[selected]:bg-rutgers_red hover:shadow-md'
    return (
        <div className="flex flex-col items-center w-full h-full bg-gray-100 border-gray-100 grow">
            <div className="grid grid-cols-[40%_60%] w-full p-2 space-x-2">
                <div className = "col-start-1 row-span-full">
                    <NameTile />
                    <div className='p-1' />
                    <CollaboratorTile />
                    <FinalMeetingTile/>
                    <LocationTile/>
                </div>

                <div className='p-1' />
                <div className = "col-start-2 row-span-full">
                    <Tile>
                        <div className='bg-white'>
                            <TabGroup>
                                <div className='flex justify-end pt-2 pr-2'>
                                    <TabList>
                                        <Tab className={tabClassString}>Everyone's times</Tab>
                                        <Tab className={tabClassString}>My times</Tab>
                                    </TabList>
                                </div>
                                <TabPanels>
                                    <TabPanel>
                                        <GlobalCalendar calID={calID} />
                                    </TabPanel>
                                    <TabPanel>
                                        <UserCalendar calID={calID} />
                                    </TabPanel>
                                </TabPanels>
                            </TabGroup>
                        </div>
                    </Tile>
                </div>
            </div>
        </div>
    )
}

export default CalendarOwner;
