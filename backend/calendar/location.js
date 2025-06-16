const express = require('express');
const router = express.Router();
const User_schema = require('../user/user_schema');
const Org_schema = require('../organizations/organization_schema');
const Calendar_schema_meta = require('./calendar_schema_meta');
const { isAuthenticated } = require('../auth/passport/util');
const User = require('../user/user_schema');
const { traceLogger, _baseLogger } = require('#logger');

// Sets the location of the calendar
router.patch('/:calendar_id/location', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
    if (req.body.location === undefined || req.body.location === null) {
      res.json({
        Status: 'error',
        error: 'No location provided',
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
          'Calendar does not exist or you do not have access to this calendar',
      });
      return;
    }

    if (cal.owner.owner_type === 'organization') {
      traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: cal.owner._id });
      const org = await Org_schema.findOne({
        _id: calendar_id,
        $or: [
          { 'owner._id': req.user.uid },
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

    traceLogger.verbose("updating location of calendar...", req, {});
    await Calendar_schema_meta.updateOne(
      { _id: calendar_id },
      { $set: { location: req.body.location } }
    );

    traceLogger.verbose("updated location of calendar", req, { calendar_id: calendar_id, location: req.body.location });
    res.json({
      Status: 'ok',
      location: req.body.location,
    });
    return;
  }
);

// Gets the location of the calendar
router.get('/:calendar_id/location', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
    traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: calendar_id });
    const cal = await Calendar_schema_meta.findOne({
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
            'The calendar does not exist or you do not have access to this calendar',
        });
        return;
      }
    }

    traceLogger.verbose("fetched location of calendar", req, { calendar_id: calendar_id, location: cal.location });
    res.json({
      Status: 'ok',
      location: cal.location,
    });
  }
);

module.exports = router;
