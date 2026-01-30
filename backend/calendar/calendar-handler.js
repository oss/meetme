const service = require('./calendar-service');

async function valid_name(potential_name) {
    return true;
}

async function valid_operation(operation, res) {
    traceLogger.verbose("validating operation...", req, { operation: operation });
    if (operation === undefined || operation === null) {
	res.json({
	    Status: 'error',
	    error: 'No operation provided',
	});
	return false;
    }

    if (!operation.toString().match('add|delete|replace')) {
        res.json({
            Status: 'error',
            error: 'Invalid operation',
        });
        return false;
    }
    return true;
}

async function valid_timeblocks(timeblocks, res) {
    traceLogger.verbose("validating timeblocks...", req, { timeblocks: timeblocks });
    if (timeblocks === undefined || timeblocks === null) {
        res.json({
            Status: 'error',
            error: 'Missing timeblocks',
        });
        return false;
    }

    for (let i = 0; i < timeblocks.length; i++) {
        const timeblock = timeblocks[i];
        if (!JSON.stringify(timeblocks[i]).match(
	    '{ ?"start": ?[0-9]+ ?, ?"end": ?[0-9]+ ?}'
	)) {
	    traceLogger.verbose("invalid timeblock", req, { timeblock: timeblock });
	    res.json({
		Status: 'error',
		error: 'Invalid timeblock',
	    });
            return false;
        }

        if (timeblock.start > timeblock.end) {
            res.json({
                Status: 'error',
                error: 'Timeblock start cannot occur after end',
                Timeblock: { start: timeblock.start, end: timeblock.end },
            });
            return false;
        }

        if (i !== 0) {
            const timeblock_prev = timeblocks[i - 1];
            const timeblock_current = timeblocks[i];
            if (timeblock_prev.end > timeblock_current.start) {
                res.json({
                    Status: 'error',
                    error: 'Timeblock conflict',
                    conflict: {
                        before: timeblock_prev,
                        after: timeblock_current,
                    },
                });
                return false;
            }
        }
    }
    return true;
}

export async function setLocation(req, res) {
    const calendar_id = req.params.calendar_id;
    if (req.body.location === undefined || req.body.location === null) {
        res.json({ Status: 'error', error: 'No location provided' });
        return;
    }

    try {
	await service.setLocation(id, location, req.user.id, req);
	res.json({ Status: 'ok', location: req.body.location });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getLocation(req, res) {
    const calendar_id = req.params.calendar_id;

    try {
	const meta = await service.getMeta(id, req.user.id, req);
	res.json({ Status: 'ok', location: meta.location });
    } catch (e)
	res.json({ Status: 'error', error: e.message });
    }
}

export async function setMeetingTime(req, res) {
    const calendar_id = req.params.calendar_id;
    traceLogger.verbose("validating parameters...", req, {});
    if (req.body.start === undefined ||
	req.body.end === undefined ||
	req.body.start === null ||
	req.body.end === null
    ) {
        res.json({
            Status: 'error',
            error: 'No meeting time provided',
        });
        return;
    }

    const meeting_time = {
        start: req.body.start,
        end: req.body.end,
    };

    if (meeting_time.start > meeting_time.end) {
        traceLogger.verbose("start end time conflict", req, { times: meet_time });
        res.json({ Status: 'error', error: 'Start/End time conflict' });
        return;
    }

    try {
	await service.setMeetingTime(id, meetingTime, req.user.id, req);
        res.json({ Status: 'ok', meetingTime: meetingTime });
    } catch (e)
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getMeetingTime(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const meta = await service.getMeta(id, req.user.id, req);
	res.json({ Status: 'ok', meeting_time: meta.meetingTime });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function setName(req, res) {
    const calendar_id = req.params.calendar_id;
    const new_name = req.body.new_name;

    // basic name restrictions maybe implement more
    traceLogger.verbose("validating new name...", req, { name: new_name });
    if (!(await valid_name(new_name))) {
        res.json({ Status: 'error', error: 'Invalid name' });
        return;
    }

    try {
	await service.setName(calendar_id, new_name, req.user.id, req);
	res.json({ Status: 'ok', new_name: new_name });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getName(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const meta = await service.getMeta(id, req.user.id, req);
	res.json({ Status: 'ok', name: meta.name });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function setShareLink(req, res) {
    const calendar_id = req.params.calendar_id;

    traceLogger.verbose("validating parameters...", req, {});
    if (req.body.shareLink === undefined || req.body.shareLink === null) {
      res.json({ Status: 'error', error: 'No status provided' });
      return;
    }
    if( typeof req.body.shareLink !== 'boolean'){
        res.json({ Status: 'error', error: 'shareLink is not bool' });
        return;
    }

    try {
	await service.setShareLink(calendar_id, req.body.shareLink, req.user.id, req);
	res.json({ Status: 'ok', shareLink: req.body.shareLink });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getShareLink(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const meta = await service.getMeta(id, req.user.id, req);
	res.json({ Status: 'ok', shareLink: meta.shareLink });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getUserList(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const memberlist = await service.getUserList(id, req.user.id, req);
	res.json({ Status: 'ok', memberlist: memberlist });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function setOwner(req, res) {
    const calendar_id = req.params.calendar_id;
    const newowner = req.body;

    traceLogger.verbose("validating parameters...", req, {});
    if (newowner === undefined) {
        res.json({ Status: 'error', error: 'Missing body' });
        return;
    }
    console.log(JSON.stringify(req.body));
    if (!JSON.stringify(req.body).match(
	'{"id":"[a-zA-Z0-9]+"(?:,"owner_type":"individual")}'
    )) {
	traceLogger.verbose("invalid new owner", req, { newowner: newowner });
        res.json({ Status: 'error', error: 'invalid body format' });
        return;
    }
    try {
	await service.setowner(calendar_id, newowner, req.user.id, req);
	res.json({ Status: 'ok' });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function setUserTimeblocks(req, res) {
    const calendar_id = req.params.calendar_id;

    const mode = req.body.mode;
    if (!(await valid_operation(mode))) {
	return;
    }
    const timeblocks = req.body.timeblocks;
    if (!(await valid_timeblocks(timeblocks))) {
	return;
    }
    try {
	switch (mode) {
	case 'add':
	    await service.addUserTimeblocks(calendar_id, timeblocks, req.user.id, req);
	    break;
	case 'subtract':
	    await service.subUserTimeblocks(calendar_id, timeblocks, req.user.id, req);
	    break;
	case 'replace':
	    await service.repUserTimeblocks(calendar_id, timeblocks, req.user.id, req);
	    break;
	}
	res.json({ 'Status': 'ok', timeblocks: timeblocks });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function setTimeblocks(req, res) {
    const calendar_id = req.params.calendar_id;
    const mode = req.body.mode;
    if (!(await valid_operation(mode))) {
	return;
    }
    const timeblocks = req.body.timeblocks;
    if (!(await valid_timeblocks(timeblocks))) {
	return;
    }

    try {
	switch (mode) {
	case 'add':
	    await service.addTimeblocks(calendar_id, timeblocks, req.user.id, req);
	    break;
	case 'subtract':
	    await service.subTimeblocks(calendar_id, timeblocks, req.user.id, req);
	    break;
	case 'replace':
	    await service.repTimeblocks(calendar_id, timeblocks, req.user.id, req);
	    break;
	}
	res.json({ 'Status': 'ok', timeblocks: timeblocks });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getTimeblocks(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const meta = await service.getMeta(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', timeblocks: meta.timeblocks });
    } catch (e) {
	res.json({ Status: 'error', error: e.message });
    }
}

// TODO: figure out why we need the timezone data
export async function getUsers(req, res) {
    const calendar_id = req.params.calendar_id;
    traceLogger.verbose("validating parameters...", req, {});
    if (req.body === undefined ||
	req.body.timezone === null ||
	req.body.timezone === undefined
    ) {
        res.json({ Status: 'error', error: 'invalid body' });
        return;
    }
    const timezone_settings = {
        timeZone: req.body.timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    };

    const final_time_array = [];
    let time_array = {
        date: null,
        iso_string: null,
        times: [],
    };
    if (timezone_settings === undefined || timezone_settings === null) {
        res.json({ Status: 'error', error: 'No timezone' });
        return;
    }

    //let firstday = new Date(100, { timeZone: 'UTC' });
    //let lastday = new Date(100, {timeZone: timezone});
    //let days = Math.ceil((lastday-firstday)/86400000);
    //    time_array.date = firstday.toLocaleString('en-US', timezone_settings);
    // time_array.iso_string = firstday.toISOString();

    try {
	const meta = await service.getMeta(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', users: meta.users });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function() getMe(req, res) {
    const calendar_id = req.params.calendar_id;
    traceLogger.verbose("validating parameters...", req, {});
    if (req.body === undefined ||
	req.body.timezone === null ||
	req.body.timezone === undefined
    ) {
        res.json({
            Status: 'error',
            error: 'invalid body',
        });
        return;
    }
    const timezone_settings = {
        timeZone: req.body.timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    };

    if (timezone_settings === undefined || timezone_settings === null) {
        res.json({
            Status: 'error',
            error: 'No timezone',
        });
        return;
    }

    try {
	const timeline = await service.getTimeline(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', timeline: timeline });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function shareCalendar(req, res) {
    const calendar_id = req.params.calendar_id;
    const new_users = req.body.new_users;

    traceLogger.verbose("validating parameters...", req, { new_users: new_users });
    if (new_users === undefined || new_users === null) {
	res.json({ Status: 'error', error: 'No users found' });
	return;
    }

    if (new_users.length === 0) {
        res.json({ Status: 'error', error: 'new_users is empty' });
        return;
    }

    if (!JSON.stringify(new_users).match('(?:"[a-zA-Z0-9]+",?)+')) {
        res.json({ Status: 'error', error: 'Invalid new_user syntax' });
        return;
    }

    try {
	const payload = await service.shareCalendar(calendar_id, new_users, req.user.id, req);
	res.json({ Status: 'ok', payload: payload });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function unshareCalendar(req, res) {
    const calendar_id = req.params.calendar_id;
    const users = req.body.target_users;

    traceLogger.verbose("validating parameters...", req, { users: users });
    if (target_users === undefined || target_users === null) {
        res.json({ Status: 'error', error: 'No users found' });
        return;
    }

    if (target_users.length === 0) {
        res.json({ Status: 'error', error: 'target_users is empty' });
        return;
    }

    if (!JSON.stringify(target_users).match('(?:"[a-zA-Z0-9]+",?)+')) {
        res.json({ Status: 'error', error: 'Invalid target_user syntax' });
        return;
    }

    try {
	const payload = await service.unshareCalendar(calendar_id, users, req.user.id, req);
	res.json({ Status: 'ok', payload: payload });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function acceptInvite(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const id = await service.acceptInvite(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', calendar_id: id });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function acceptSharelinkInvite(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const id = await service.acceptSharelinkInvite(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', calendar_id: id });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function declineInvite(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const id = await service.declineInvite(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', calendar_id: id });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function leaveCalendar(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const id = await service.leaveCalendar(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', calendar_id: id });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function createCalendar(req, res) {
    traceLogger.verbose("validating calendar public status...", req, {});
    const { owner, timeblocks, name, location, public } = req.body;
    if (public !== undefined && !public.toString().match('true|false')) {
        req.json({ Status: 'error', error: 'Need a valid public status' });
        return;
    }

    if (!(await valid_timeblocks(timeblocks))) {
	return;
    }

    //impemented default name of 'untitled' below, maybe uncomment to add banned names?
    /*
    const name = req.get('name');
    if (name === undefined) {
        res.json({
            Status: "error",
            error: "No name found"
        });
        return;
    }
    */

    // verify owner data is ok and able to create calendar
    traceLogger.verbose("checking for owner...", req, {});
    if (owner === undefined) {
        traceLogger.verbose("no owner specified, defaulting to requester as owner", req, {});
        owner = { type: 'individual', id: req.user.uid };
    }

    try {
	const calendar = await service.createCalendar(owner, timeblocks, name, location, public, req.user.id, req);
	res.json({ Status: 'ok', calendar: calendar });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function deleteCalendar(req, res) {
    const calendar_id = req.params.calendar_id;

    try {
	const calendar = await service.deleteCalendar(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', calendar: calendar });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getMeta(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const meta = await service.getMeta(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', metadata: meta });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getMain(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	const meta = await service.getMain(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', maindata: main });
    } catch {
	res.json({ Status: 'error', error: e.message });
    }
}

export async function getLinks(req, res) {
    res.json({
	Status: 'error',
	error: 'Not implemented',
    });
    return;
}
