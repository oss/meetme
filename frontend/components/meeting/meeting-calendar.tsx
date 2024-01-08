import React from "react";
import MeetingHeader from "./meeting-header";
import MeetingGrid from "./meeting-grid";
import MeetingLabels from "./meeting-labels";

interface IMeetingCalendar {
    title: string;
    startHour: number;
    endHour: number;
    potentialMeetings: Date[];
    collaborators: any[];
    meetingId: string;

    readonly: boolean;
    buttonTitle?: string;
    onButtonPress?: any;
    setSelectedUsers: (selectedUsers: any[]) => void;
    globalTimeline:any
}

function MeetingCalendar({
    title,
    startHour,
    endHour,
    potentialMeetings,
    collaborators,
    meetingId,
    readonly,
    buttonTitle,
    onButtonPress,
    setSelectedUsers,
    globalTimeline,
}: IMeetingCalendar) {
    const timeIntervals: number = 10;
    const blockHeight: number = 0.9;
    const rowsCount: number = Math.ceil(
        (endHour - startHour) / (60 * 1000 * timeIntervals)
    );
    return (
        <div className="flex w-full">
            <MeetingLabels
                displayHeight={blockHeight}
                rowsCount={rowsCount}
                startHour={new Date(startHour)}
                timeIntervals={timeIntervals}
            />
            <div className="w-full">
                <MeetingHeader
                    title={title}
                    buttonTitle={buttonTitle}
                    onButtonPress={onButtonPress}
                />
                <MeetingGrid
                    displayHeight={blockHeight}
                    startHour={new Date(startHour)}
                    timeIntervals={timeIntervals}
                    rowsCount={rowsCount}
                    potentialMeetings={potentialMeetings}
                    readonly={readonly}
                    meetingId={meetingId}
                    collaborators={collaborators}
                    setSelectedUsers={setSelectedUsers}
                    globalTimeline={globalTimeline}
                />
            </div>
        </div>
    );
}

export default MeetingCalendar;
