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
	return;
    }
}
