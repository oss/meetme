const express = require('express');
const router = express.Router();
const User_schema = require('../user/user_schema');
const Org_schema = require('../organizations/organization_schema');
const Calendar_schema_main = require('./calendar_schema_main');
const Calendar_schema_meta = require('./calendar_schema_meta');
const { isAuthenticated } = require('../auth/passport/util');
const { traceLogger, _baseLogger } = require('#logger');

// Sets the meeting time of a calendar
router.patch('/:calendar_id/meet_time', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
    traceLogger.verbose("validating parameters...", req, {});
    if (
        req.body.start === undefined ||
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
        res.json({
            Status: 'error',
            error: 'Start/End time conflict',
        });
        return;
    }

    traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: calendar_id });
    const cal = await Calendar_schema_meta.findOne({
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
            _id: cal.owner._id,
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

    traceLogger.verbose("updating meeting time of calendar...", req, { });
    await Calendar_schema_meta.updateOne(
        { _id: calendar_id },
        { $set: { meetingTime: meeting_time } }
    );

    traceLogger.verbose("updated meeting time of calendar", req, { calendar_id: calendar_id, meeting_time: meeting_time });
    res.json({
        Status: 'ok',
        meeting_time: meeting_time,
    });
    return;
}
);

// Gets the meeting time of a calendar
router.get('/:calendar_id/meet_time',isAuthenticated,async function (req, res) {
    const calendar_id = req.params.calendar_id;
    traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: calendar_id });
    const cal = await Calendar_schema_main.findOne({
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
          'Calendar does not exist or you do not have access to this calendar',
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

    traceLogger.verbose("fetched meeting time of calendar", req, { calendar_id: calendar_id, meeting_time: cal.meetingTime });
    res.json({
        Status: 'ok',
        meeting_time: cal.meetingTime,
    });
}
);

module.exports = router;
