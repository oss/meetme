const express = require('express');
const router = express.Router();
const Calendar_schema_main = require('./calendar_schema_main');
const User_schema = require('../user/user_schema');
const mongoose = require('mongoose');
const Org_schema = require('../organizations/organization_schema');
const { isAuthenticated } = require('../auth/passport/util');
const { traceLogger, _baseLogger } = require('#logger');

router.patch('/:calendar_id/timeblocks', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
    const operation = req.body.operation;
    traceLogger.verbose("validating operation...", req, { operation: operation });
    if (operation === undefined || operation === null) {
        res.json({
            Status: 'error',
            error: 'No operation provided',
        });
        return;
    }

    if (!operation.toString().match('add|delete|replace')) {
        res.json({
            Status: 'error',
            error: 'Invalid operation',
        });
        return;
    }

    let timeblocks = req.body.timeblocks;
    traceLogger.verbose("validating timeblocks...", req, { timeblocks: timeblocks });
    if (timeblocks === undefined || timeblocks === null) {
        res.json({
            Status: 'error',
            error: 'Missing timeblocks',
        });
        return;
    }

    switch (operation) {
        case 'add':
            await addmode();
            return;
        case 'delete':
            await submode();
            return;
        case 'replace':
	    traceLogger.verbose("replace mode", req, { });
            for (let i = 0; i < timeblocks.length; i++) {
		traceLogger.verbose("validating timeblock...", req, { timeblock: timeblocks[i] });
                if (timeblocks[i].start >= timeblocks[i].end) {
                    res.json({
                        Status: 'e',
                        error: 'Invalid timeblocks',
                    });
                    return;
                }
                if (
                    !JSON.stringify(timeblocks[i]).match(
                        '{ ?"start": ?[0-9]+ ?, ?"end": ?[0-9]+ ?}'
                    )
                ) {
                    res.json({
                        Status: 'error',
                        error: 'Invalid timeblock',
                    });
                    return;
                }
            }

            for (let i = 1; i < timeblocks.length; i++) {
                if (timeblocks[i - 1].end > timeblocks[i].start) {
		    traceLogger.verbose("timeblock conflict...", req, { timeblock1: timeblocks[i - 1], timeblock2: timeblocks[i] });
                    res.json({
                        Status: 'error',
                        error: 'Invalid timeblocks',
                    });
                    return;
                }
            }
            await repmode(req, netid, calendar_id, res, timeblocks);
            return;
    }
});

router.get('/:calendar_id/timeblocks', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
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
                'Calendar does not eixst or you do not have access to this calendar',
        });
        return;
    }

    if (cal.owner.owner_type === 'organization') {
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
    traceLogger.verbose("fetched calendar timeblocks", req, { uid: req.user.uid, owner: cal.owner, calendar_id: calendar_id, timeblocks: cal.blocks });
    res.json({
        Status: 'ok',
        timeblocks: cal.blocks,
    });
}
);

async function addmode() { }

async function submode() { }

async function repmode(req, netid, calendar_id, res, timeblocks) {
    //db.calendars.find({_id:"d386808522386e75936c35583dc668eff5be278bbef9f5ab392b636f922080f0", "users.netid": 'abcd'})
    traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: calendar_id });
    const calendar = await Calendar_schema_main.findOne({
        _id: calendar_id,
        'users._id': netid,
    });

    if (calendar === null) {
        res.json({
            Status: 'error',
            error: 'No valid calendar found',
        });
        return;
    }

    //db.calendars.update({_id: "d386808522386e75936c35583dc668eff5be278bbef9f5ab392b636f922080f0", 'users.netid': 'abcd'},{$set: {'users.$.netid': "test2"}})

    traceLogger.verbose("updating calendar", req, { });
    await Calendar_schema_main.updateOne(
        { _id: calendar_id },
        { $set: { blocks: timeblocks } }
    );

    traceLogger.verbose("updated timeblocks for calendar", req, { calendar_id: calendar_id, timeblocks: timeblocks });
    res.json({
        Status: 'ok',
    });
    return;
}

module.exports = router;
