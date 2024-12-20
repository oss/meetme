import Tile from '@primitives/tile';

import { Button } from '@headlessui/react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

import GlobalCalendar from './calendarPanels/globalCalendar';
import UserCalendar from './calendarPanels/userCalendar';

import calendarMetadata from '@store/calendarMetadata';
import calendarMaindata from '@store/calendarMaindata';
import dialogueStore from '@store/dialogueStore';
import { hoveredUsersStore } from './calendarPanels/globalCalendar/state';

function CalendarOwner({ calID }) {
    const setPanel = dialogueStore((store) => store.setPanel)
    const calendarName = calendarMetadata((store) => store.calendarMetadata[calID].data.name)
    const [start, end] = calendarMetadata((store) => [store.calendarMetadata[calID].data.meetingTime.start, store.calendarMetadata[calID].data.meetingTime.end])
    const location = calendarMaindata((store) => store.calendarData[calID].data.location)
    const hoveredUsers = hoveredUsersStore((store) => store.hoveredUsers)

    const memberList = calendarMaindata((store) => {
        const calendar = store.calendarData[calID].data;
        const memberListArr = []
        switch (calendar.owner.owner_type) {

            case 'individual':
                memberListArr.push({ role: 'owner', IDs: [calendar.owner._id] })

                memberListArr.push({ role: 'users', IDs: [] })
                calendar.users.forEach((member, index) => {
                    if (calendar.owner._id !== member._id)
                        memberListArr[1]['IDs'].push(member._id)
                });

                break;
        }

        return memberListArr;

    })


    const MemberTileList = () => {
        return (
            <ul>
                {memberList.map((roleEntry, idx) =>
                    <li key={idx}>
                        <p className="font-bold text-xs text-slate-400/70">{roleEntry.role.toUpperCase()}</p>
                        <ul>
                            {roleEntry.IDs.map((netid, idx) =>
                                <li key={idx} className={`${hoveredUsers.has(netid) && 'bg-rutgers_red  text-white'}`}>
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


        const getTextValue = () => {
            if (start === null || end === null)
                return ('Meeting time has not been set.')
            return `Start: ${new Date(start).toLocaleString()} End: ${new Date(end).toLocaleString()}`
        }

        return (
            <Tile>
                <div className='bg-white'>
                    <Tile.Body>
                        <div className="flex justify-between items-center">
                            <Tile.Title>
                                Meeting Time
                            </Tile.Title>
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
                        </div>
                        {location || 'No location set'}
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
