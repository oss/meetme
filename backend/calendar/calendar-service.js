const mongoose = require('mongoose');
const Calendar_schema_meta = require('./calendar_schema_meta');
const Calendar_schema_main = require('./calendar_schema_main');
const User_schema = require('../user/user_schema');
const Org_schema = require('../organizations/organization_schema');
const { valid_netid } = require('../auth/util/LDAP_utils');
const { traceLogger, _baseLogger } = require('#logger');

// TODO: hoik req out of these by using a middleware logging

// Determines if a user can write to the calendar. A user can write if the
// following requirements are satisfied:
//    calendar: user must be the owner of the calendar
//    org calendar: user must be owner, admin, or editor
// Returns the calendar or throw an error
async function getWritableCalendar(id, userid, req) {
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
	if (org === null) {
	    throw new Error("Permission denied");
	}
    }
    if (cal === null) {
	throw new Error("Permission denied");
    }
    return cal;
}

// Returns the main data associated with the calendar. This method handles
// permissions and will return the data only if the user is allowed to read it.
// A user is allowed to read a calendar if any of the following are satisfied:
//    calendar: user must be the owner, user, or view of the calendar
//    org calendar: user must be owner, admin, editor, member, or viewer
//    pending: pending users of an org or calendar can always read
// Returns the calendar or throws an error.
export async function getMain(id, userid, req) {
    traceLogger.verbose('fetching main data for calendar...', req, { calendar_id: id });
    const cal = await Calendar_schema_main.findOne({
	_id: id,
	$or: [
	    { 'owner.owner_type': 'organization' },
	    { 'owner._id': userid },
	    { 'users._id': userid },
	    { 'viewers._id': userid },
	    { 'pendingUsers._id': userid },
	],
    });
    if (cal !== null && cal.owner.owner_type === 'organization') {
	traceLogger.verbose('calendar belongs to org, checking if user is in organization...', req, { calendar_id: id, org: cal.owner._id });
	const org = await Org_schema.findOne({
	    _id: id,
	    $or: [
		{ owner: userid },
		{ 'admins._id': userid },
		{ 'editors._id': userid },
		{ 'members._id': userid },
		{ 'viewers._id': userid },
		{ 'pendingMembers._id': userid },
	    ],
	});

	if (org === null) {
	    throw new Error("Permission denied");
	}
    }
    if (cal === null) {
	throw new Error("Permission denied");
    }

    return cal;
}

export async function getMeta(id, userid, req) {
    const cal = await getMain(id, userid, req);
    const metadata = await Calendar_schema_meta.findOne({ _id: id });
    return metadata;
}

export async function setLocation(id, userid, location, req) {
    traceLogger.verbose('updating location of calendar...', req, { calendar_id: id, location: location, user: userid });
    await getWritableCalendar(id, userid, req);
    await Calendar_schema_meta.findByIdAndUpdate(id, { location: location });
}

export async function setMeetingTime(id, meetingTime, userid, req) {
    traceLogger.verbose("updating meeting time of calendar...", req, { calendar_id: id, meetingTime: meetingTime });
    await getWritableCalendar(id, userid, req);
    await Calendar_schema_meta.findByIdAndUpdate(id, { meetingTime: meetingTime });
}

export async function setName(id, name, userid, req) {
    traceLogger.verbose('updating name of calendar...', req, { calendar_id: id, name: name });
    await getWritableCalendar(id, userid, req);
    await Calendar_schema_metadata.findByIdAndUpdate(id, { name: name });
}

export async function setShareLink(id, sharelink, userid, req) {
    traceLogger.verbose('updating sharelink of calendar...', req, { calendar_id: id, sharelink: sharelink });
    await getWritableCalendar(id, userid, req);
    await Calendar_schema_meta.findByIdAndUpdate(id, { shareLink: shareLink });
}

export async function getUserList(id, userid, req) {
    traceLogger.verbose('fetching userlist of calendar...', req, { calendar_id: id, user: userid });

    const cal = await getMain(id, userid, req);
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
        'calendars._id': id,
        _id: { $nin: nin_arr },
    });

    for (const individual of all_individual_shared) {
        memberlist.push({ _id: individual, type: 'user' });
    }

    return memberlist;
}

export async function setOwner(id, newowner, userid, req) {
    traceLogger.verbose('updating owner of calendar...', req, { calendar_id: id, newowner: owner, user: userid });
    const cal = await getWritableCalendar(id, userid, req);
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
}

export async function repUserTimeblocks(id, timeblocks, userid, req) {
    traceLogger.verbose('replacing user timeblocks of calendar...', req, { calendar_id: id, timeblocks: timeblocks, user: userid });
    const cal = await getWritableCalendar(id, userid, req);
    mongoose.connection.transaction(async () => {
	// We don't have to check if the calendar is individual or organization
	// because we handle it the same in both cases:
	//   If the user does not exist in the current array of users,
	//      then add it and then set the timeblocks.
	//   If the user already exists, then just set the timeblocks
	// Only difference is that for an individual the owner is the only user
	if (cal.users.some((item) => item._id === userid)) {
	    await Calendar_schema_main.updateOne(
		{ _id: id, 'users._id': userid },
		{ $set: { 'users.$.times': timeblocks } }
	    );
	} else {
	    await Calendar_schema_main.updateOne(
		{ _id: id },
		{ $push: { users: { _id: userid, times: timeblocks } } }
	    );
	}

	// TODO: mongodb natively supports modified times, maybe look into using that
        // Update modified time in the metadata
        const current_time = new Date().getTime();
        await Calendar_schema_meta.updateOne(
	    { _id: id },
	    { $set: { modified: current_time} }
        );
    });
}

// TODO: implement
export async function addUserTimeblocks(id, timeblocks, userid, req) { };
export async function subUserTimeblocks(id, timeblocks, userid, req) { };

export async function repTimeblocks(id, timeblocks, userid, req) {
    traceLogger.verbose('replacing timeblocks of calendar...', req, { calendar_id: id, timeblocks: timeblocks, user: userid });
    await getWritableCalendar(id, userid, req);
    await Calendar_schema_main.findByIdAndUpdate(id, { blocks: timeblocks });
}

// TODO: implement
export async function addTimeblocks(id, timeblocks, userid, req) { };
export async function subTimeblocks(id, timeblocks, userid, req) { };

export async function getTimeine(id, userid, req) {
    traceLogger.verbose('fetching user\'s timeline for calendar...', req, { calendar_id: id, user: userid });
    const cal = await getReadableCalendar(id, userid, req);
    return await Calendar_schema_main.aggregate([
	{ $match: { _id: id } },
	{
	    $addFields: {
		timeline: {
		    $filter: {
			input: '$users',
			as: 'item',
			cond: { $eq: ['$$item._id', userid] },
		    },
		},
	    },
	},
	{ $project: { timeline: 1 } },
    ]);
}

export async function shareCalendar(id, users, userid, req) {
    traceLogger.verbose("sharing calendars with users...", req, { calendar_id: id, users: users });
    const cal = await getWritableCalendar(id, user, req);

    const payload = {
	already_added: [],
	new_users: [],
	added: [],
	not_added: [],
    };

    traceLogger.verbose("creating payload...", req, {});
    for (let i = 0; i < users.length; i++) {
	const new_user = users[i];
	if (!(await valid_netid(new_user))) {
            traceLogger.verbose("skipping invalid netid in payload", req, { user: new_user });
            payload.not_added.push(new_user);
            continue;
	}

	const usr = await User_schema.findOne({ _id: new_user });
	if (usr === null) {
	    traceLogger.verbose("no user found, an account will be created", req, { user: new_user });
	    cal.pendingUsers.push({ _id: new_user });
            payload.new_users.push(new_user);
            payload.added.push(new_user);
            continue;
	}

	if (user.hasSharedCalendar(id)) {
	    traceLogger.verbose("already shared with user", req, { user: new_user });
	    payload.already_added.push(new_user);
	} else {
            traceLogger.verbose("added user to payload", req, { user: new_user });
            payload.added.push(new_user);
            calendar.pendingUsers.push({ _id: new_user });
	}
    }

    // Wrap in transaction since it is multi-table modifications
    mongoose.connection.transaction.(async() => {
	for (const user of payload.new_users) {
	    traceLogger.verbose("user account created and added to payload", req, { user: user });
	    await create_user(user);
	}

	traceLogger.verbose("updating calendar...", req, {});
	await calendar.save();

	traceLogger.verbose("updating users...", req, {});
	await User_schema.updateMany(
	    { _id: { $in: payload.added } },
	    { $push: { pendingCalendars: { _id: id } } }
	);
    });

    return payload;
}

export async function unshareCalendar(id, users, userid) {
    traceLogger.verbose("unsharing calendars with users...", req, { calendar_id: id, users: users });
    const cal = await getWritableCalendar(id, user, req);

    const payload = {
	removed: [],
	not_removed: [],
    };

    traceLogger.verbose("creating payload...", req, {});
    if (cal.owner.owner_type === 'organization') {
	const org = await Org_schema.findOne({
	    _id: cal.owner._id,
	    $or: [
		{ 'owner._id': userid },
		{ 'admins._id': userid },
		{ 'editors._id': userid },
	    ],
	});

	for (const user of users) {
	    if (org.hasAdmin(user)) {
		traceLogger.verbose("user is owner or admin, skipping...", req, { user: user });
		payload.not_removed.push(user);
	    } else {
		traceLogger.verbose("added user for removal", req, { user: user });
		payload.removed.push(user);
	    }
	}
    } else {
	for (const user of users) {
	    if (user === cal.owner._id) {
		traceLogger.verbose("user is owner, skipping...", req, { user: new_user });
		payload.not_removed.push(new_user);
	    } else { 
		traceLogger.verbose("added user for removal", req, { user: new_user });
		payload.removed.push(new_user);
	    }
	}
    }

    // Wrap in transaction since it is multi-table modifications
    mongoose.connection.transaction(async () => {
        traceLogger.verbose("updating calendar...", req, {});
        await Calendar_schema_main.updateOne(
	    { _id: id },
	    { $pull: { users: { _id: { $in: payload.removed } } } }
        );

        traceLogger.verbose("updating users...", req, {});
        await User_schema.updateMany(
	    { _id: { $in: payload.removed } },
	    { $pull: { calendars: { _id: id } } }
        );
    });

    return payload;
}

export async function acceptInvite(id, userid, req) {
    traceLogger.verbose("accepting calendar invite for user...", req, { calendar_id: id, userid: userid });
    const cal = await Calendar_schema_main.findOne({
	_id: id,
	'pendingUsers._id': userid,
    });
    if (cal === null) {
	throw new Error("User has not been invited to calendar or calendar does not exist");
    }

    // Wrap in transaction since it is multi-table modifications
    mongoose.connection.transaction(async () => {
        traceLogger.verbose("updating calendar...", req, {});
        await Calendar_schema_main.updateOne(
	    { _id: id },
	    {
                $pull: { pendingUsers: { _id: userid } },
                $push: { users: { _id: userid, times: [] } },
	    }
        );

        traceLogger.verbose("updating user...", req, {});
        await User_schema.updateOne(
	    { _id: userid },
	    {
                $pull: { pendingCalendars: { _id: id } },
                $push: { calendars: { _id: id } },
	    }
        );
    });

    return id;
}

export async function acceptSharelinkInvite(id, userid, req) {
    traceLogger.verbose("accepting calendar sharelink invite for user...", req, { calendar_id: id, userid: userid });
    const calendar = await Calendar_schema_meta.findOne({ _id: id, shareLink: true });
    if (calendar === null) {
	throw new Error("Calendar does not have link sharing or calendar does not exist");
    }

    const user = await User_schema.findOne({ _id: userid, 'calendars._id': id });
    if (user !== null) {
	throw new Error("User already has the calendar");
    }

    // Wrap in transaction since it is multi-table modifications
    mongoose.connection.transaction(async () => {
        traceLogger.verbose("updating calendar...", req, {});
        await Calendar_schema_main.updateOne(
	    { _id: id },
	    {
                $pull: { pendingUsers: { _id: userid } },
                $addToSet: { users: { _id: userid, times: [] } },
	    }
        );
        traceLogger.verbose("updating user...", req, {});
        await User_schema.updateOne(
	    { _id: userid },
	    {
                $pull: { pendingCalendars: { _id: id } },
                $addToSet: { calendars: { _id: id } },
	    }
        );
    });
    return id;
}

export async function declineInvite(id, userid, req) {
    traceLogger.verbose("declining calendar invite for user...", req, { calendar_id: id, userid: userid });
    const cal = await Calendar_schema_main.findOne({ _id: id, 'pendingUsers._id': userid });
    if (cal === null) {
	throw new Error("User has not been invited to calendar or calendar does not exist");
    }

    // Wrap in transaction since it is multi-table modifications
    mongoose.connection.transaction(async () => {
        traceLogger.verbose("updating user...", req, {});
        await User_schema.updateOne(
	    { _id: userid },
	    { $pull: { pendingCalendars: { _id: id } } }
        );
        traceLogger.verbose("updating calendar...", req, {});
        await Calendar_schema_main.updateOne(
	    { _id: id },
	    { $pull: { pendingUsers: { _id: userid } } }
        );
    });

    return id;
}

// Wrap in transaction since it is multi-table modifications
export async function leaveCalendar(id, userid, req) {
    traceLogger.verbose("leaving calendar for user...", req, { calendar_id: id, userid: userid });
    const cal = await Calendar_schema_main.findOne({ _id: id, 'users._id': userid });
    if (cal === null) {
	throw new Error("Calendar does not exist or you are not in the calendar");
    }
    if (cal.owner._id === userid) {
	throw new Error("You cannot leave the calendar when you are the owner")
    }

    mongoose.connection.transaction(async () => {
        traceLogger.verbose("updating user...", req, {});
        await User_schema.updateOne(
	    { _id: userid },
	    {
                $pull: { calendars: { _id: id } },
	    }
        );
        traceLogger.verbose("updating calendar...", req, {});
        await Calendar_schema_main.updateOne(
	    { _id: id },
	    {
                $pull: { users: { _id: userid } },
	    }
        );
    });
    return id;
}

export async function createCalendar(owner, timeblocks, name, location, public, userid, req) {
    traceLogger.verbose("creating calendar...", req, {});
    const calendar_maindata = new Calendar_schema_main();
    const calendar_metadata = new Calendar_schema_meta();

    const calendar_id = createHash('sha512')
        .update(new Date().getTime().toString() + owner.owner_id + Math.random())
        .digest('base64url');
    calendar_maindata._id = calendar_id;
    calendar_metadata._id = calendar_id;

    calendar_metadata.name = name || 'untitled';
    calendar_metadata.location = location || null;
    calendar_metadata.created = new Date().getTime();
    calendar_metadata.modified = new Date().getTime();
    calendar_metadata.description = [];
    calendar_maindata.links = [];
    calendar_metadata.public = public || false; //false by default
    calendar_metadata.shareLink = public || false; //false by default

    //TODO: double check that owner and org id match
    calendar_maindata.owner = {
        owner_type: owner.type,
        _id: owner.id,
    };
    calendar_metadata.owner = {
        owner_type: owner.type,
        _id: owner.id,
    };
    calendar_maindata.blocks = timeblocks;
    calendar_metadata.meetingTime = { start: null, end: null };

    // A little duplication, but we don't really want error paths inside of the
    // mongoose transaction
    traceLogger.verbose("validating owner conditions for new calendar...", req, { org: owner.id });
    if (owner.type === 'individual' && owner.id !== userid) {
	throw new Error('Owner does not match session');
    } else if {
	traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: owner.id });
	const target_org = await Org_schema.findOne({
	    _id: owner.id,
	    $or: [
		{ owner: { _id: userid } },
		{ editors: { _id: userid } },
		{ admins: { _id: userid } },
	    ],
	});
	if (target_org === null) {
	    throw new Error('Organization not found or invalid permissions');
	}
    }

    traceLogger.verbose("inserting calendar...", req, {});
    await mongoose.connection.transaction(async () => {
	if (owner.type === 'individual') {
	    calendar_maindata.users = [{ _id: owner.id, times: [] }];
	    await User_schema.updateOne(
		{ _id: userid },
		{ $push: { calendars: { _id: id } } }
	    );
	} else {
            calendar_maindata.users = [];
            await Org_schema.updateOne(
		{ _id: owner.id },
		{ $push: { calendars: { _id: id } } }
            );
	}

        await calendar_metadata.save();
        await calendar_maindata.save();
    });

    const recieved_meta = await Calendar_schema_meta.findOne(
	calendar_metadata,
	{ __v: 0 }
    );
    const recieved_main = await Calendar_schema_main.findOne(
	calendar_maindata,
	{ __v: 0 }
    );

    //idk what ._doc does but it gives us what we need
    return { ...recieved_meta, ...recieved_main }._doc;
}

export async function deleteCalendar(id, userid, req) {
    traceLogger.verbose("deleting calendar", req, { calendar_id: id, userid: userid });
    const cal = getWritableCalendar(id, userid);
    if (cal === null) {
	throw new Error('Permission denied or no calendar');
    }

    traceLogger.verbose("checking owner conditions for calendar deletion", req, {});
    if (cal.owner.owner_type === 'individual' & userid !== cal.owner._id) {
	traceLogger.verbose("unable to delete calender, user is not owner", req, { owner: cal.owner_id });
	throw new Error('Permission denied');
    } else if (cal.owner.owner_type === 'organization') {
	traceLogger.verbose("owner is org, checking if user has permission to delete...", req, { owner: cal.owner_id });
	const org = await Org_schema.findOne({
	    _id: cal.owner._id,
	    $or: [{ owner: userid }, { 'admins._id': userid }],
	});
	if (org === null) {
	    throw new Error('Permission denied or no organization');
	}
    }

    await mongoose.connection.transaction(async () => {
	traceLogger.verbose("deleting calendar...", req, {});

	//delete calendar from database
	await Calendar_schema_main.deleteOne({ _id: id });
	await Calendar_schema_meta.deleteOne({ _id: id });

	//remove calendar from all users
	await User_schema.updateMany(
	    { _id: { $in: cal.users._id } },
	    { $pull: { calendars: { _id: id } } }
	);
	//remove all viewers
	await User_schema.updateMany(
	    { _id: { $in: cal.viewers._id } },
	    { $pull: { calendars: { _id: id } } }
	);
	await User_schema.updateMany(
	    { _id: { $in: cal.pendingUsers._id } },
	    { $pull: { pendingCalendars: { _id: id } } }
	);

        if (cal.owner.owner_type === 'organization') {
            await Org_schema.updateOne(
                { _id: cal.owner._id },
                { $pull: { calendars: { _id: id } } }
            );
	}
	// TODO: I am pretty sure this is not needed since we already nuked the
	// calendar from everyone
	//delete all individually shared users in org calendar
	// await User_schema.updateOne(
	//     { _id: req.user.uid },
	//     { $pull: { calendars: { _id: calendar_id } } }
	// );
    });
    return id;
}

// export async function getLinks(id, userid, req) {
//     try {
// 	const links = await Calendar_schema_main.aggregate([
// 	    { $unwind: '$_id' },
// 	    { $match: { links } },
// 	    { $group: { _id: '$_id' } },
// 	]);
// 	if (links === null) {
// 	    res.json({
// 		Status: 'error',
// 		error:
// 		    'Calendar does not exist or you do not have access to this calendar',
// 	    });
// 	    return;
// 	}
// 	res.json({
// 	    Status: 'ok',
// 	    calendar: links,
// 	});
// 	traceLogger.verbose("fetched calendar links", req, { uid: req.user.uid, calendar_id: req.params.calendar_id });
//     } catch (e) {
// 	res.json({
// 	    Status: 'error',
// 	    error: 'backend error occured',
// 	});
//     }
// }
