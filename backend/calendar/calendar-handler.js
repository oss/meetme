const mongoose = require('mongoose');
const Calendar_schema_meta = require('./calendar_schema_meta');
const service = require('./calendar-service');

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
	return;
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
