//todo, check if org/user exists
const express = require('express');
const router = express.Router();
const Calendar_schema_maindata = require('./calendar_schema_main');
const User_schema = require('../user/user_schema');
const mongoose = require('mongoose');
const Org_schema = require('../organizations/organization_schema');
const { traceLogger, _baseLogger } = require('#logger');

//sets a new owner of a calendar
router.patch('/:calendar_id/owner', async function (req, res) {
    const calendar_id = req.params.calendar_id;

    const newowner = req.body;
    traceLogger.verbose("validating parameters...", req, {});
    if (newowner === undefined) {
        res.json({
            Status: 'error',
            error: 'Missing body',
        });
        return;
    }

    console.log(JSON.stringify(req.body));
    if (
        !JSON.stringify(req.body).match(
            '{"id":"[a-zA-Z0-9]+"(?:,"owner_type":"individual")}'
        )
    ) {
        traceLogger.verbose("invalid new owner", req, { newowner: newowner });
        res.json({
            Status: 'error',
            error: 'invalid body format',
        });
        return;
    }

    traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: calendar_id });
    const target_cal = await Calendar_schema_maindata.findOne({
        _id: calendar_id,
        $or: [
            { 'owner._id': req.user.uid },
            { 'owner.owner_type': 'organization' },
        ],
    });
    if (target_cal === null) {
        res.json({
            Status: 'error',
            error:
        'Calendar does not exist or you do not have permissions to change ownership of this calendar',
        });
        return;
    } else if (target_cal.owner.owner_type === 'organization') {
        traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: target_cal.owner._id });
        const org = await Org_schema.findOne({
            _id: target_cal.owner._id,
            owner: req.user.uid,
        });
        if (org === null) {
            res.json({
                Status: 'error',
                error:
          'Calendar does not exist or you do not have permissions to change ownership of this calendar',
            });
            return;
        }
    }

    if (
        newowner.owner_type === undefined ||
    newowner.owner_type === 'individual'
    ) {
        traceLogger.verbose("new owner is individual, checking if user exists...", req, { owner: newowner._id });
        if ((await User_schema.findOne({ _id: newowner.id })) === null) {
            res.json({
                Stauts: 'error',
                error: 'User has not made an account',
            });
            return;
        }
    } else {
        traceLogger.verbose("new owner is org, checking if org exists...", req, { owner: newowner._id });
        if ((await Org_schema.findOne({ _id: newowner.id })) === null) {
            res.json({
                Status: 'error',
                error: 'Org does not exist',
            });
            return;
        }
    }

    //possibilities
    /*
        individual to individual -> easy
        individual to org -> easy
        org to individual
        org to org
    */

    // not implmeneting for now but all pre-checks good
    // TODO: implementing updating owner

    traceLogger.verbose("updated owner of calendar", req, { calendar_id: calendar_id, new_owner: newowner });
    res.json({
        Status: 'ok',
    });
});

module.exports = router;
