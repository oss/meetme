import React, { useState, useEffect } from 'react';
import UserCalendar from '../../components/utils/calendar/user-calendar';
import GlobalCalendar from '../../components/utils/calendar/global-calendar';
import Tile from '../../components/utils/tile';
import renderCollabatorsList from '../../components/member-list';

function CalendarUser({
    metadata,
    maindata,
    meetme,
    memberlist,
    timeline,
    timeblocks,
    meeting_time,
    timeline_setstate,
}) {
    function renderMeetingCollaboratorsTile() {
        return (
            <Tile title="Collaborators">
                <p className="font-bold text-xs text-slate-400/70">OWNER</p>
                {renderCollabatorsList(['owner'], memberlist)}
                <p className="font-bold text-xs text-slate-400/70">MEMBERS</p>
                {renderCollabatorsList(['member', 'user'], memberlist)}
                <p className="font-bold text-xs text-slate-400/70">VIEWERS</p>
                {renderCollabatorsList(['member', 'viewer'], memberlist)}
            </Tile>
        );
    }

    function renderFinalMeetingTimeTile() {
        return (
            <Tile title="Final Meeting" className="col-start-1">
                {meeting_time.start !== null && meeting_time.end !== null ? (
                    <div>
                        <p>Start: {new Date(meeting_time.start).toString()}</p>
                        <p>End: {new Date(meeting_time.end).toString()}</p>
                    </div>
                ) : (
                    'No meeting time has been set'
                )}
            </Tile>
        );
    }

    function renderLocationTile() {
        return (
            <Tile title="Location">
                {metadata.location ? metadata.location : 'No location has been set'}
            </Tile>
        );
    }

    return (
        <>
            <div className="w-full h-full bg-gray-100 flex flex-col items-center grow border-gray-100">
                <div className="grid grid-cols-[20%_40%_40%] w-full">
                    <div className="col-start-1 row-span-full">
                        {renderMeetingCollaboratorsTile()}
                        {renderFinalMeetingTimeTile()}
                        {renderLocationTile()}
                    </div>
                    <div className="col-start-2 row-span-full">
                        <Tile overflowX>
                            <GlobalCalendar
                                meetme_input={meetme}
                                memberlist_input={memberlist}
                            />
                        </Tile>
                    </div>
                    <div className="col-start-3 row-span-full">
                        <Tile overflowX>
                            <UserCalendar
                                meetme_input={meetme}
                                timeline_input={timeline}
                                timeblocks_input={timeblocks}
                                cal_id={metadata._id}
                                timeline_setstate={timeline_setstate}
                            />
                        </Tile>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CalendarUser;
