import Tile from '../../components/tile';
import calendarMetadata from '../../store/calendarMetadata';
import calendarMaindata from '../../store/calendarMaindata';
import dialogueStore from '../../store/dialogueStore';
import CalendarNameTile from './content/calNameTile';
import RedButton from '../../components/utils/red-button';
import InviteDialogue from './dialogues/inviteDialogue';
import CalendarLocationTile from './content/calLocationTile';
import CalendarMeetingTimeTile from './content/calMeetingTimeTile';

import MeetingCalendar from './calendarPanels/meeting-calendar'
import UserCalendar from './userCalendarTEMP/meeting-calendar';

function CalendarOwner({ calID }) {
    const setPanel = dialogueStore((store) => store.setPanel)

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
                                <li key={idx}>
                                    {netid}
                                </li>
                            )}
                        </ul>
                    </li>
                )}
            </ul>
        )
    }

    return (
        <div className="flex flex-col items-center w-full h-full bg-gray-100 border-gray-100 grow">
            <CalendarNameTile calID={calID} />
            <CalendarLocationTile calID={calID} />
            <CalendarMeetingTimeTile calID={calID} />
            <Tile>
                <div className='bg-white w-full h-full'>
                    <RedButton onClick={() => { setPanel(<InviteDialogue calID={calID} />) }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 inline"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                            />
                        </svg>
                        +
                    </RedButton>
                    <Tile.Title>
                        Collaborators
                    </Tile.Title>
                    <MemberTileList />
                </div>
            </Tile>
            <MeetingCalendar calID={calID} />
            <UserCalendar calID={calID} />
        </div>
    )
}

export default CalendarOwner;
