const mongoose = require('mongoose');
const Calendar_schema_meta = require('./calendar_schema_meta');
const Calendar_schema_main = require('./calendar_schema_main');
const User_schema = require('../user/user_schema');
const Org_schema = require('../organizations/organization_schema');
const { traceLogger, _baseLogger } = require('#logger');

// Determines if a user can write to the calendar. A user can write if the
// following requirements are satisfied:
//    calendar: user must be the owner of the calendar
//    org calendar: user must be owner, admin, or editor
// Returns the calendar if true or null
export async function getWritableCalendar(id, userid, req) {
    traceLogger.verbose('fetching calendar for writing...', req, { calendar_id: id, user: userid });
    const cal = await Calendar_schema_meta.findOne({
	_id: id,
	$or: [
	    { 'owner.owner_type': 'organization' },
	    { 'owner._id': userid },
	],
    });
    if (cal !== null && cal.owner.owner_type === 'organization') {
	traceLogger.verbose('checking calendar write permissions for user...', req, { id: id, org: cal.owner._id, user: userid });
	const org = await Org_schema.findOne({
	    _id: id,
	    $or: [
		{ 'owner._id': userid },
		{ 'admins._id': userid },
		{ 'editors._id': userid },
	    ],
	});
	return (org === null) ? null : cal;
    }
    return cal;
}

// Determines if a user can read the calendar. A user can read if the following
// requirements are satisfied:
//    calendar: user must be the owner, user, or view of the calendar
//    org calendar: user must be owner, admin, editor, member, or viewer
// Returns the calendar if true or null
export async function getReadableCalendar(id, userid, req) {
    traceLogger.verbose('fetching calendar for reading...', req, { calendar_id: id, user: userid });
    const cal = await Calendar_schema_meta.findOne({
	_id: id,
	$or: [
	    { 'owner.owner_type': 'organization' },
	    { 'owner._id': userid },
	    { 'users._id': userid },
	    { 'viewers._id': userid },
	],
    });
    if (cal !== null && cal.owner.owner_type === 'organization') {
	traceLogger.verbose('checking calendar read permissions for user...', req, { calendar_id: id, org: cal.owner._id, user: userid });
	const org = await Org_schema.findOne({
	    _id: id,
	    $or: [
		{ owner: userid },
		{ 'admins._id': userid },
		{ 'editors._id': userid },
		{ 'members._id': userid },
		{ 'viewers._id': userid },
	    ],
	});
	return (org === null) ? null : cal;
    }
    return cal;
}

export async function setLocation(id, userid, location, req) {
    traceLogger.verbose('updating location of calendar...', req, { calendar_id: id, location: location, user: userid });
    if ((await getWritableCalendar(id, userid, req)) !== null) {
	await Calendar_schema_meta.updateOne(
	    { _id: id },
	    { $set: { location: location } }
	);
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function getLocation(id, userid, req) {
    traceLogger.verbose('fetching location of calendar...', req, { calendar_id: id, user: userid });
    const cal = await getReadableCalendar(id, userid, req);
    if (cal !== null) {
	return cal.location;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function setMeetingTime(id, meetingTime, userid, req) {
    traceLogger.verbose("updating meeting time of calendar...", req, { calendar_id: id, user: userid, meetingTime: meetingTime });
    if ((await getWritableCalendar(id, userid, req)) !== null) {
        await Calendar_schema_meta.updateOne(
	    { _id: id },
	    { $set: { meetingTime: meetingTime } }
        );
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function getMeetingTime(id, userid, req) {
    traceLogger.verbose('fetching meeting time of calendar...', req, { calendar_id: id, user: userid });
    const cal = await getReadableCalendar(id, userid, req);
    if (cal !== null) {
	return cal.meetingTime;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function setName(id, name, userid, req) {
    traceLogger.verbose('updating name of calendar...', req, { calendar_id: id, name: name, user: userid });
    if ((await getWritableCalendar(id, userid, req)) !== null) {
	await Calendar_schema_metadata.updateOne(
	    { _id: id },
	    { $set: { name: name } }
	);
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function getName(id, userid, req) {
    traceLogger.verbose('fetching name of calendar...', req, { calendar_id: id, user: userid });
    const cal = await getReadableCalendar(id, userid, req);
    if (cal !== null) {
	return cal.name;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function setShareLink(id, sharelink, userid, req) {
    traceLogger.verbose('updating sharelink of calendar...', req, { calendar_id: id, sharelink: sharelink, user: userid });
    if ((await getWritableCalendar(id, userid, req)) !== null) {
	await Calendar_schema_meta.updateOne(
	    { _id: id },
	    { $set: { shareLink: shareLink } }
	);
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function getShareLink(id, userid, req) {
    traceLogger.verbose('fetching sharelink of calendar...', req, { calendar_id: id, user: userid });
    const cal = await getReadableCalendar(id, userid, req);
    if (cal !== null) {
	return cal.shareLink;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function getUserList(id, userid, req) {
    traceLogger.verbose('fetching userlist of calendar...', req, { calendar_id: id, user: userid });
    const cal = await getReadableCalendar(id, userid, req);
    if (cal !== null) {
	traceLogger.verbose("creating memberlist...", req, {});
	const memberlist = [];
	const nin_arr = [];
	if (cal.owner.owner_type === 'individual') {
	    memberlist.push({ _id: cal.owner._id, type: 'owner' });
	    nin_arr.push(cal.owner._id);
	}
	for (let i = 0; i < cal.viewers.length; i++) {
	    memberlist.push({ _id: cal.viewers[i]._id, type: 'viewer' });
	    nin_arr.push(cal.viewers[i]._id);
	}

	const all_individual_shared = await User_schema.distinct('_id', {
            'calendars._id': req.params.calendar_id,
            _id: {
		$nin: nin_arr,
            },
	});

	for (let i = 0; i < all_individual_shared.length; i++) {
            memberlist.push({ _id: all_individual_shared[i], type: 'user' });
	}

	return memberlist;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function setOwner(id, newowner, userid, req) {
    traceLogger.verbose('updating owner of calendar...', req, { calendar_id: id, newowner: owner, user: userid });
    const cal = await getWritableCalendar(id, userid, req);
    if (cal !== null) {
	if (newowner.owner_type === undefined || newowner.owner_type === 'individual') {
	    traceLogger.verbose("new owner is individual, checking if user exists...", req, { owner: newowner._id });
	    if ((await User_schema.findOne({ _id: newowner.id })) === null) {
		throw new Error("User does not exist");
	    }
	} else {
	    traceLogger.verbose("new owner is org, checking if org exists...", req, { owner: newowner._id });
	    if ((await Org_schema.findOne({ _id: newowner.id })) === null) {
		throw new Error("Organization does not exist");
	    }
	}

	/** 
	 * possibilities
	 * individual to individual -> easy
	 * individual to org -> easy
	 * org to individual
	 * org to org
	 */
	// TODO: implmement
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function repUserTimeblocks(id, timeblocks, userid, req) {
    traceLogger.verbose('replacing user timeblocks of calendar...', req, { calendar_id: id, timeblocks: timeblocks, user: userid });
    const cal = await getWritableCalendar(id, userid, req);
    if (cal !== null) {
	mongoose.connection.transaction(async () => {
	    if (cal.owner.owner_type == "individual") {
		await Calendar_schema_main.updateOne(
		    { _id: id, 'users._id': userid },
		    { $set: { 'users.$.times': timeblocks } }
		);
	    } else
		// If the user does not exist in the current array of users,
		// then add it and then set the timeblocks.
		// If the user already exists, then just set the timeblocks.
		// TODO: have to change this to one query instead of two seperate querys. Not sure if it is possible.
                const calendar = await Calendar_schema_main.findOne({
		    _id: id,
		    'users._id': userid,
                });
                if (calendar === null) {
		    await Calendar_schema_main.updateOne(
                        { _id: id },
                        { $push: { users: { _id: userid, times: timeblocks } } }
		    );
                } else {
		    await Calendar_schema_main.updateOne(
                        { _id: id, 'users._id': userid },
                        { $set: { 'users.$.times': timeblocks } }
		    );
                }
	    }

            //update modified time in the metadata
            const current_time = new Date().getTime();
            await Calendar_schema_meta.updateOne(
		{ _id: id },
		{ $set: { modified: current_time} }
            );
	});
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

// TODO: implement
export async function addUserTimeblocks(id, timeblocks, userid, req) { };
export async function subUserTimeblocks(id, timeblocks, userid, req) { };

export async function repTimeblocks(id, timeblocks, userid, req) {
    traceLogger.verbose('replacing timeblocks of calendar...', req, { calendar_id: id, timeblocks: timeblocks, user: userid });
    if ((await getWritableCalendar(id, userid, req)) !== null) {
        await Calendar_schema_main.updateOne(
	    { _id: id },
	    { $set: { blocks: timeblocks } }
        );
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

// TODO: implement
export async function addTimeblocks(id, timeblocks, userid, req) { };
export async function subTimeblocks(id, timeblocks, userid, req) { };

export async function getTimeblocks(id, userid, req) {
    traceLogger.verbose('fetching timeblocks of calendar...', req, { calendar_id: id, user: userid });
    const cal = await getReadableCalendar(id, userid, req);
    if (cal !== null) {
	return cal.blocks;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}
