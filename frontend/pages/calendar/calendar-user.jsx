import Tile from '@primitives/tile';
import Stack from '@primitives/stack';

import { Button } from '@headlessui/react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

import InviteDialogue from '@components/stateful/dialogues/inviteDialogue';
import RenameDialogue from '@components/stateful/dialogues/renameDialogue';
import LocationDialogue from '@components/stateful/dialogues/locationDialogue';
import MeetingTimeDialogue from '@components/stateful/dialogues/meetingTimeDialogue';

import GlobalCalendar from './calendarPanels/globalCalendar';
import GoogleCalendar from './calendarPanels/googleCalendar';
import UserCalendar from './calendarPanels/userCalendar';

import calendarMetadata from '@store/calendarMetadata';
import calendarMaindata from '@store/calendarMaindata';
import googleStore from '@store/googleStore'
import dialogueStore from '@store/dialogueStore';
import { hoveredUsersStore } from './calendarPanels/globalCalendar/state';
import memberListStore from './store';

function CalendarOwner({ calID }) {
    const setPanel = dialogueStore((store) => store.setPanel)
    const calendarName = calendarMetadata((store) => store.calendarMetadata[calID].data.name)
    const start = calendarMetadata((store) => store.calendarMetadata[calID].data.meetingTime.start)
    const end = calendarMetadata((store) => store.calendarMetadata[calID].data.meetingTime.end)
    const location = calendarMetadata((store) => store.calendarMetadata[calID].data.location)
    const hoveredUsers = hoveredUsersStore((store) => store.hoveredUsers)

    const memberList = memberListStore((store)=>store.memberList)

    const fetchGoogleData = googleStore((store) => store.fetchGoogleData)
    const valid = googleStore((store) => store.valid)

    const startHour = calendarMaindata((store) => store.calendarData[calID].data.blocks[0].start)
    const columnCount = calendarMaindata((store) => {
        return store.calendarData[calID].data.blocks.length
    });
    const endHour = calendarMaindata((store) => store.calendarData[calID].data.blocks[columnCount-1].end)


    const MemberTileList = () => {
        return (
            <ul>
                {memberList.map((roleEntry, idx) =>
                    <li key={idx}>
                        <p className="font-bold text-xs text-slate-400/70">{roleEntry.role.toUpperCase()}</p>
                        <ul>
                            {roleEntry.IDs.map((netid, idx) =>
                                <li key={idx} className={`${hoveredUsers.has(netid) && 'bg-rutgers_red text-white'}`}>
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
                        </div>
                        <MemberTileList />
                    </Tile.Body>
                </div>
            </Tile>
        )
    }

    const FinalMeetingTile = () => {

        const getTextValue = (() => {
            if (start === null || end === null)
                return ('Meeting time has not been set.')
            return `Start: ${new Date(start).toLocaleString()} End: ${new Date(end).toLocaleString()}`
        })()

        return (
            <Tile>
                <div className='bg-white'>
                    <Tile.Body>
                        <div className="flex justify-between items-center">
                            <Tile.Title>
                                Meeting Time
                            </Tile.Title>
                        </div>
                        <p>{getTextValue}</p>
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
                        </div>
                        <p className = "text-nowrap overflow-hidden text-ellipsis">{location|| 'No location set'}</p>
                    </Tile.Body>
                </div>
            </Tile>
        )
    }

    const GoogleTile = () => {
        return (
            <Tile>
                <div className='bg-white'>
                    <Tile.Body>
                        <div className="flex justify-between items-center">
                            <Tile.Title>
                                Google Calendar Integration
                            </Tile.Title>
                            {valid ?<Button
                                className="px-1 ml-1 transition-all ease-linear rounded text-gray-600 hover:text-gray-400"
                                onClick={() => {fetchGoogleData(calID, startHour, endHour) }}
                            >
                                Get Google Calendar
                            </Button> : <div></div>}
                        </div>
                        <p className = "text-nowrap overflow-hidden text-ellipsis">{valid? "Linked" : "not Linked"}</p>
                    </Tile.Body>
                </div>
            </Tile>
        )
    }

    /*
                <CalendarLocationTile calID={calID} />
            <CalendarMeetingTimeTile calID={calID} />

    */
    const tabClassString = 'rounded-full py-1 px-3 mb-2 text-sm/6 font-semibold focus:outline-none data-[selected]:bg-rutgers_red data-[selected]:text-white hover:shadow-md hover:bg-slate-100'
    return (
        <div className="flex flex-col items-center w-full h-full bg-gray-100 border-gray-100 grow">
            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] w-full p-2 space-x-2">
                <div className = "col-start-1 row-span-full">
                    <NameTile />
                    <div className='p-1' />
                    <CollaboratorTile />
                    <FinalMeetingTile/>
                    <LocationTile/>
                    <GoogleTile/>
                </div>

                <div className='p-1' />
                <div className = "col-start-1 md:col-start-2 md:row-span-full">
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
                                    <Stack>
                                        <Stack.Item>
                                            <ul className='relative flex flex-wrap' >
                                                <GlobalCalendar calID={calID} />
                                            </ul>
                                        </Stack.Item>
                                        <Stack.Item>
                                            <ul className='relative flex flex-wrap pointer-events-none'>
                                                <GoogleCalendar calID={calID} />
                                            </ul>
                                        </Stack.Item>
                                    </Stack>
                                        
                                    </TabPanel>
                                    <TabPanel>
                                        <Stack>
                                        <Stack.Item>
                                            <ul className='relative flex flex-wrap pointer-events-none' >
                                                <GoogleCalendar calID={calID} />
                                            </ul>
                                        </Stack.Item>
                                        <Stack.Item>
                                            <ul className='relative flex flex-wrap'>
                                                <UserCalendar calID={calID} />
                                            </ul>
                                        </Stack.Item>
                                    </Stack>
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
