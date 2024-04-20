import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import calendarMaindataStore from '../store/calendarMaindata';
import calendarMetadataStore from '../store/calendarMetadata';
import authData from '../store/authStore';
import orgData from '../store/orgData';

function CalendarLoader() {
    const { id } = useParams();
    const netID = authData((store) => store.userData.user.uid)

    const [addCalMain] = calendarMaindataStore((store) => [store.addCalendar])
    const [addCalMeta] = calendarMetadataStore((store) => [store.addCalendar])

    const isLoaded = calendarMaindataStore((store) => {
        if (id in store.calendarData) return store.calendarData[id].isLoaded
        
        addCalMain(id)
        addCalMeta(id)

        //return false;
    })

    const ownerType = calendarMaindataStore((store) => isLoaded && store.calendarData[id].data.owner.owner_type || null)
    const ownerID = calendarMaindataStore((store) => isLoaded && store.calendarData[id].data.owner._id || null)
    const calendarRole = calendarMaindataStore((store) => {

        if (isLoaded === false) return null;
        console.log(store.calendarData[id])
        const calendar = store.calendarData[id].data;

        switch (ownerType) {
            case 'individual': {
                console.log(calendarMaindataStore.getState())
                const isOwner = ownerID === netID;
                if (isOwner) return 'owner'

                const isUser = calendar.users.some((uname) => uname._id === netID)
                if (isUser) return 'user'

                const isViewer = calendar.viewers.some((uname) => uname._id === netID)
                if (isViewer) return 'viewer'

            }
            case 'organization': {
                const orgDataSnapshot = orgData.getState();
                const orgOwnerInfo = orgDataSnapshot.orgData[ownerID]

                if (orgOwnerInfo.isLoaded === false) {
                    orgDataSnapshot.fetchOrgData(ownerID)
                    return null
                }

                return 'bleb'

            }
        }
    });

    if (isLoaded === false)
        return (
            <div>
                Loading calendar data...
            </div>
        )

    return (
        <div>
            <div>
                owner type: {ownerType}
            </div>
            <div>
                role: {calendarRole}
            </div>
        </div>
    )

    /*
    switch (ownerType) {
        case 'individual': {
            return (
                <div>
                    <div>
                        owner type: {ownerType}
                    </div>
                    <div>
                        role: {calendarRole}
                    </div>
                </div>
            )
        }
        case 'organization': {
            return (<div>org cal</div>)
        }
    }
    */
}

export default CalendarLoader;
    /*
useEffect(() => {
if (
meetme === null ||
timeblocks === null ||
meetme.Status !== 'ok' ||
timeblocks.Status !== 'ok'
)
return;
let cuts = [];
meetme.users.forEach((user) => {
user.times.forEach((time) => {
cuts.push(time.start, time.end);
});
});
timeblocks.timeblocks.forEach((time) => {
cuts.push(time.start, time.end);
let d = new Date(time.start);
d.setMilliseconds(0);
d.setSeconds(0);
d.setHours(0);
cuts.push(d.valueOf());

d = new Date(time.end);
d.setMilliseconds(0);
d.setSeconds(0);
d.setHours(0);
cuts.push(d.valueOf());
});
cuts = Array.from(new Set(cuts));
cuts.sort((a, b) => {
return a - b;
});

//remove duplicate times
const single_timeline = [];
for (let i = 1; i < cuts.length; i++) {
single_timeline.push({ start: cuts[i - 1], end: cuts[i], users: null });
}

// marks valid blocks in timeline by setting users to an array
timeblocks.timeblocks.forEach((valid_time) => {
for (let i = 0; i < single_timeline.length; i++) {
if (
    valid_time.start <= single_timeline[i].start &&
    valid_time.end >= single_timeline[i].end
) {
    single_timeline[i].users = [];
}
}
});
single_timeline.push({
start: single_timeline[single_timeline.length - 1].end,
end: Number.MAX_VALUE,
available_users: null,
});

meetme.users.forEach((user) => {
user.times.forEach((newBlock) => {
for (let i = 0; i < single_timeline.length; i++) {
    if (
        newBlock.start <= single_timeline[i].start &&
        newBlock.end >= single_timeline[i].end
    ) {
        if (single_timeline[i].users != null) {
            console.log(user);
            single_timeline[i].users.push(user._id);
        }
    }
}
});
});

let meetme_day_obj = {
date: new Date(single_timeline[0].start).toLocaleDateString('en-US'),
times: [],
};
const final_daysplit_meetme = [];
for (let i = 0; i < single_timeline.length - 1; i++) {
const start_block = single_timeline[i].start;
const start_str = new Date(start_block).toLocaleDateString('en-US');
//console.log('checking '+JSON.stringify(single_timeline[i]));

//start in correct day
if (start_str === meetme_day_obj.date) {
//end in correct day
meetme_day_obj.times.push({
    start: single_timeline[i].start,
    available_users: single_timeline[i].users,
});
}
//in next day so we change day and then retry
else {
final_daysplit_meetme.push(meetme_day_obj);
meetme_day_obj = {
    date: start_str,
    times: [],
};
i--;
}
}
meetme_day_obj.times.push({
start: timeblocks.timeblocks[timeblocks.timeblocks.length - 1].end,
available_users: null,
});
//console.log(final_daysplit_meetme);

final_daysplit_meetme.push(meetme_day_obj);
for (let i = 0; i < final_daysplit_meetme.length; i++) {
const day = final_daysplit_meetme[i];
while (day.times[0].available_users === null) {
day.times = day.times.slice(1);
}
}

//console.log(final_daysplit_meetme);
set_meetme_passthrough(final_daysplit_meetme);
}, [meetme, timeline]);
*/

/*
if (cal_metadata.metadata.owner.owner_type === 'individual')
    if (cal_metadata.metadata.owner._id === getUser().uid)
        return (
            <CalendarOwner
                metadata={cal_metadata.metadata}
                maindata={cal_maindata.maindata}
                meetme={meetme_passthrough}
                memberlist={memberlist.memberlist}
                timeline={timeline}
                timeblocks={timeblocks.timeblocks}
                meeting_time={meet_time.meeting_time}
                timeline_setstate={set_timeline}
            />
        );
    else if (
        cal_maindata.maindata.viewers.some((uname) => {
            return uname._id === getUser().uid;
        })
    )
        return (
            <CalendarViewer
                metadata={cal_metadata.metadata}
                maindata={cal_maindata.maindata}
                meetme={meetme_passthrough}
                memberlist={memberlist.memberlist}
                timeline={timeline}
                timeblocks={timeblocks.timeblocks}
                meeting_time={meet_time.meeting_time}
                timeline_setstate={set_timeline}
            />
        );
    else
        return (
            <CalendarUser
                metadata={cal_metadata.metadata}
                maindata={cal_maindata.maindata}
                meetme={meetme_passthrough}
                memberlist={memberlist.memberlist}
                timeline={timeline}
                timeblocks={timeblocks.timeblocks}
                meeting_time={meet_time.meeting_time}
                timeline_setstate={set_timeline}
            />
        );

if (org_memberlist === null) return <div>Fetching org data</div>;

if (org_memberlist.Status === 'error') {
    return (
        <div>Error getting org memberlist message: {org_memberlist.error}</div>
    );
}

//able to edit calendars
if (org_memberlist.memberlist.owner === getUser().uid)
    return (
        <CalendarOwner
            metadata={cal_metadata.metadata}
            maindata={cal_maindata.maindata}
            meetme={meetme_passthrough}
            memberlist={memberlist.memberlist}
            timeline={timeline}
            timeblocks={timeblocks.timeblocks}
            meeting_time={meet_time.meeting_time}
            timeline_setstate={set_timeline}
            org_memberlist={org_memberlist.memberlist}
        />
    );
if (
    org_memberlist.memberlist.admins.some((uname) => {
        return uname._id === getUser().uid;
    })
)
    return (
        <CalendarOwner
            metadata={cal_metadata.metadata}
            maindata={cal_maindata.maindata}
            meetme={meetme_passthrough}
            memberlist={memberlist.memberlist}
            timeline={timeline}
            timeblocks={timeblocks.timeblocks}
            meeting_time={meet_time.meeting_time}
            timeline_setstate={set_timeline}
            org_memberlist={org_memberlist.memberlist}
        />
    );
if (
    org_memberlist.memberlist.editors.some((uname) => {
        return uname._id === getUser().uid;
    })
)
    return (
        <CalendarEditor
            metadata={cal_metadata.metadata}
            maindata={cal_maindata.maindata}
            meetme={meetme_passthrough}
            memberlist={memberlist.memberlist}
            timeline={timeline}
            timeblocks={timeblocks.timeblocks}
            meeting_time={meet_time.meeting_time}
            timeline_setstate={set_timeline}
            org_memberlist={org_memberlist.memberlist}
        />
    );

//is a viewer
if (
    org_memberlist.memberlist.viewers.some((uname) => {
        return uname._id === getUser().uid;
    })
)
    return (
        <CalendarViewer
            metadata={cal_metadata.metadata}
            maindata={cal_maindata.maindata}
            meetme={meetme_passthrough}
            memberlist={memberlist.memberlist}
            timeline={timeline}
            timeblocks={timeblocks.timeblocks}
            meeting_time={meet_time.meeting_time}
            timeline_setstate={set_timeline}
            org_memberlist={org_memberlist.memberlist}
        />
    );
if (
    cal_maindata.maindata.viewers.some((uname) => {
        return uname._id === getUser().uid;
    })
)
    return (
        <CalendarViewer
            metadata={cal_metadata.metadata}
            maindata={cal_maindata.maindata}
            meetme={meetme_passthrough}
            memberlist={memberlist.memberlist}
            timeline={timeline}
            timeblocks={timeblocks.timeblocks}
            meeting_time={meet_time.meeting_time}
            timeline_setstate={set_timeline}
            org_memberlist={org_memberlist.memberlist}
        />
    );

//is a regular user
return (
    <CalendarUser
        metadata={cal_metadata.metadata}
        maindata={cal_maindata.maindata}
        meetme={meetme_passthrough}
        memberlist={memberlist.memberlist}
        timeline={timeline}
        timeblocks={timeblocks.timeblocks}
        meeting_time={meet_time.meeting_time}
        timeline_setstate={set_timeline}
        org_memberlist={org_memberlist.memberlist}
    />
);
*/