const express = require('express');
const router = express.Router();
const Calendar_schema_metadata = require('./calendar_schema_meta');
const Org_schema = require('../organizations/organization_schema');
const { isAuthenticated } = require('../auth/passport/util');
const { traceLogger, _baseLogger } = require('#logger');

// Renames a calendar
router.patch('/:calendar_id/name', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
    const new_name = req.body.new_name;

    //basic name restrictions maybe implement more
    traceLogger.verbose("validating new name...", req, { name: new_name });
    if (!(await valid_name(new_name))) {
        res.json({
            Status: 'error',
            error: 'Invalid name',
        });
        return;
    }

    await mongoose.connection.transaction(async () => {
        traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: calendar_id });
        const cal = await Calendar_schema_metadata.findOne({
            _id: calendar_id,
            $or: [
                { 'owner.owner_type': 'organization' },
                { 'owner._id': req.user.uid },
            ],
        });

        if (cal === null) {
            res.json({
                Status: 'error',
                error:
	'Calendar does not eixst or you do not have access to this calendar',
            });
            return;
        }

        if (cal.owner.owner_type === 'organization') {
            traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: cal.owner._id });
            const org = await Org_schema.findOne({
                _id: calendar_id,
                $or: [
	  { owner: req.user.uid },
	  { 'admins._id': req.user.uid },
	  { 'editors._id': req.user.uid },
                ],
            });
            if (org === null) {
                res.json({
	  Status: 'error',
	  error:
	  'The calendar does not exist or you do not have access to modify this calendar',
                });
                return;
            }
        }

        traceLogger.verbose("updating name of calendar...", req, {});
        await Calendar_schema_metadata.updateOne(
            { _id: calendar_id },
            { name: new_name }
        );

        traceLogger.verbose("updated name of calendar", req, { calendar_id: calendar_id, new_name: new_name });
        res.json({
            Status: 'ok',
            new_name: new_name,
        });
    });
});

// Gets the name of a calendar
router.get('/:calendar_id/name', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;

    traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: calendar_id });
    const cal = await Calendar_schema_metadata.findOne({
        _id: calendar_id,
        $or: [
            { 'owner.owner_type': 'organization' },
            { 'owner._id': req.user.uid },
            { 'users._id': req.user.uid },
            { 'viewers._id': req.user.uid },
        ],
    });
    if (cal === null) {
        res.json({
            Status: 'error',
            error:
        'The calendar does not exist or you do not have access to modify this calendar',
        });
        return;
    }

    if (cal.owner.owner_type === 'organization') {
        traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: cal.owner._id });
        const org = await Org_schema.findOne({
            _id: cal.owner._id,
            $or: [
                { owner: req.user.uid },
                { 'admins._id': req.user.uid },
                { 'editors._id': req.user.uid },
                { 'members._id': req.user.uid },
                { 'viewers._id': req.user.uid },
            ],
        });
        if (org === null) {
            res.json({
                Status: 'error',
                error:
          'The calendar does not exist or you do not have access to modify this calendar',
            });
            return;
        }
    }

    traceLogger.verbose("fetched name of calendar", req, { calendar_id: calendar_id, name: cal.name });
    res.json({
        Status: 'ok',
        name: cal.name,
    });
});

async function valid_name(potential_name) {
    return true;
}

module.exports = router;
