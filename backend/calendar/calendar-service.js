const mongoose = require('mongoose');
const Calendar_schema_meta = require('./calendar_schema_meta');
const { traceLogger, _baseLogger } = require('#logger');

// Determines if a user can write to the calendar. A user can write if the
// following requirements are satisfied:
//    calendar: user must be the owner of the calendar
//    org calendar: user must be owner, admin, or editor
// Returns the calendar if true or null
export async function getWritableCalendar(id, userid, req) {
    traceLogger.verbose('fetching calendar for writing...', req, { calendar_id: calendar_id, user: userid });
    const cal = await Calendar_schema_meta.findOne({
	_id: id,
	$or: [
	    { 'owner.owner_type': 'organization' },
	    { 'owner._id': userid },
	],
    });
    if (cal !== null && cal.owner.owner_type === 'organization') {
	traceLogger.verbose('checking calendar write permissions for user...', req, { calendar_id: id, org: cal.owner._id, user: userid });
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
    traceLogger.verbose('fetching calendar for reading...', req, { calendar_id: calendar_id, user: userid });
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
    if (getWritableCalendar(id, userid, req) !== null) {
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
    const cal = getReadableCalendar(id, userid, req);
    if (cal !== null) {
	return cal.location;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function setMeetingTime(id, meetingTime, userid, req) {
    traceLogger.verbose("updating meeting time of calendar...", req, { calendar_id: id, user: userid, meetingTime: meetingTime });
    if (getWritableCalendar(id, userid, req) !== null) {
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
    const cal = getReadableCalendar(id, userid, req);
    if (cal !== null) {
	return cal.meetingTime;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function setName(id, name, userid, req) {
    traceLogger.verbose('updating name of calendar...', req, { calendar_id: id, name: name, user: userid });
    if (getWritableCalendar(id, userid, req) !== null) {
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
    const cal = getReadableCalendar(id, userid, req);
    if (cal !== null) {
	return cal.name;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}

export async function setShareLink(id, sharelink, userid, req) {
    traceLogger.verbose('updating sharelink of calendar...', req, { calendar_id: id, sharelink: sharelink, user: userid });
    if (getWritableCalendar(id, userid, req) !== null) {
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
    const cal = getReadableCalendar(id, userid, req);
    if (cal !== null) {
	return cal.shareLink;
    } else {
	throw new Error('Permission denied or no calendar');
    }
}
