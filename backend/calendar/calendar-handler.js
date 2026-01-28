const service = require('./calendar-service');

async function valid_name(potential_name) {
    return true;
}

export async function setLocation(req, res) {
    const calendar_id = req.params.calendar_id;
    if (req.body.location === undefined || req.body.location === null) {
        res.json({ Status: 'error', error: 'No location provided' });
        return;
    }

    try {
	service.setLocation(id, location, req.user.id, req);
	res.json({ Status: 'ok', location: req.body.location });
    } catch (e) {
	res.json({ Status: 'error', error: 'Calendar does not exist or you do not have access to this calendar' });
    }
}

export async function getLocation(req, res) {
    const calendar_id = req.params.calendar_id;

    try {
	const location = service.getLocation(id, req.user.id, req);
	res.json({ Status: 'ok', location: cal.location });
    } catch (e)
	res.json({ Status: 'error', error: 'Calendar does not exist or you do not have access to this calendar' });
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
	service.setMeetingTime(id, meetingTime, req.user.id, req);
        res.json({ Status: 'ok', meetingTime: meetingTime });
    } catch (e)
	res.json({ Status: 'error', error: 'Calendar does not exist or you do not have access to this calendar' });
    }
}

export async function getMeetingTime(res, req) {
    const calendar_id = req.params.calendar_id;
    try {
	const meetingTime = service.getMeetingTime(id, req.user.id, req);
	res.json({ Status: 'ok', meeting_time: cal.meetingTime });
    } catch (e) {
	res.json({ Status: 'error', error: 'Calendar does not exist or you do not have access to this calendar' });
    }
}

export async function setName(res, req) {
    const calendar_id = req.params.calendar_id;
    const new_name = req.body.new_name;

    // basic name restrictions maybe implement more
    traceLogger.verbose("validating new name...", req, { name: new_name });
    if (!(await valid_name(new_name))) {
        res.json({ Status: 'error', error: 'Invalid name' });
        return;
    }

    try {
	service.setName(calendar_id, new_name, req.user.id, req);
	res.json({ Status: 'ok', new_name: new_name });
    } catch (e) {
	res.json({ Status: 'error', error: 'Calendar does not exist or you do not have access to this calendar' });
    }
}

export async function getName(res, req) {
    const calendar_id = req.params.calendar_id;
    try {
	const name = service.getName(id, req.user.id, req);
	res.json({ Status: 'ok', name: name });
    } catch (e) {
	res.json({ Status: 'error', error: 'Calendar does not exist or you do not have access to this calendar' });
    }
}

export async function setShareLink(res, req) {
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
	service.setShareLink(calendar_id, req.body.shareLink, req.user.id, req);
	res.json({ Status: 'ok', shareLink: req.body.shareLink });
    } catch (e) {
	res.json({ Status: 'error', error: 'Calendar does not exist or you do not have access to this calendar' });
    }
}

export async function getShareLink(res, req) {
    const calendar_id = req.params.calendar_id;
    try {
	const shareLink = service.getShareLink(id, req.user.id, req);
	res.json({ Status: 'ok', shareLink: shareLink });
    } catch (e) {
	res.json({ Status: 'error', error: 'Calendar does not exist or you do not have access to this calendar' });
    }
}

export async function getUserList(res, req) {
    const calendar_id = req.params.calendar_id;
    try {
	const memberlist = service.getUserList(id, req.user.id, req);
	res.json({ Status: 'ok', memberlist: memberlist });
    } catch (e) {
	res.json({ Status: 'error', error: 'Calendar does not exist or you do not have access to this calendar' });
    }
}
