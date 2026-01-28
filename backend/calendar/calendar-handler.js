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
	if (timeblocks[i] == null) {
	    return res.json({ Status: 'error', error: `Timeblocks at index ${i} is null.` });
	}
	if (timeblocks[i].start >= timeblocks[i].end) {
	    res.json({
		Status: 'error',
		error: 'Invalid timeblocks',
		timeblock: timeblocks[i].start,
	    });
	    return false;
	}
	if (!JSON.stringify(timeblocks[i]).match(
	    '{ ?"start": ?[0-9]+ ?, ?"end": ?[0-9]+ ?}'
	)) {
	    res.json({
		Status: 'error',
		error: 'Invalid timeblock',
		timeblock: timeblocks[i],
	    });
	    return false;
	}
	if (timeblocks[i].start % (1000 * 60) !== 0 || timeblocks[i].end % (1000 * 60) !== 0) {
	    res.json({
		Status: 'error',
		error: 'not a full minute',
		timeblock: timeblocks[i],
	    });
	    return false;
	}
    }

    for (let i = 1; i < timeblocks.length; i++) {
        if (timeblocks[i - 1].end > timeblocks[i].start) {
            res.json({
                Status: 'error',
                error: 'Invalid times',
                timeblock: [
                    { index: i - 1, end: timeblocks[i - 1].end },
                    { index: i, start: timeblocks[i].start },
                ],
            });
            return false;
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
	const location = await service.getLocation(id, req.user.id, req);
	res.json({ Status: 'ok', location: cal.location });
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
	const meetingTime = await service.getMeetingTime(id, req.user.id, req);
	res.json({ Status: 'ok', meeting_time: cal.meetingTime });
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
	const name = await service.getName(id, req.user.id, req);
	res.json({ Status: 'ok', name: name });
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
	const shareLink = await service.getShareLink(id, req.user.id, req);
	res.json({ Status: 'ok', shareLink: shareLink });
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
	res.json({ Status: 'error', error: e.message);
    }
}

export async function setUserTimeblocks(req, res) {
    const calendar_id = req.params.calendar_id;

    const mode = req.body.mode;
    if (!(await valid_operation(mode))) {
	return;
    }
    const timeblocks = req.body.timeblocks;
    if (!(await valid_timeblocks(mode))) {
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
	res.json({ Status: 'error', error: e.message);
    }
}

export async function setTimeblocks(req, res) {
    const calendar_id = req.params.calendar_id;
    const mode = req.body.mode;
    if (!(await valid_operation(mode))) {
	return;
    }
    const timeblocks = req.body.timeblocks;
    if (!(await valid_timeblocks(mode))) {
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
	res.json({ Status: 'error', error: e.message);
    }
}

export async function getTimeblocks(req, res) {
    const calendar_id = req.params.calendar_id;
    try {
	blocks = await service.getTimeblocks(calendar_id, req.user.id, req);
	res.json({ Status: 'ok', timeblocks: blocks });
    } catch (e) {
	res.json({ Status: 'error', error: e.message);
    }
}
