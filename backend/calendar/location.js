const express = require('express');
const router = express.Router();
const User_schema = require('../user/user_schema');
const Org_schema = require('../organizations/organization_schema');
const Calendar_schema_meta = require('./calendar_schema_meta');
const { isAuthenticated } = require('../auth/passport/util');
const User = require('../user/user_schema');

//renames calendars
router.patch('/:calendar_id/location', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
    if (req.body.location === undefined || req.body.location === null) {
      res.json({
        Status: 'error',
        Error: 'No location provided',
      });
      return;
    }

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
        Error:
          'Calendar does not exist or you do not have access to this calendar',
      });
      return;
    }

    if (cal.owner.owner_type === 'organization') {
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
          Error:
            'The calendar does not exist or you do not have access to modify this calendar',
        });
        return;
      }
    }

    await Calendar_schema_meta.updateOne(
      { _id: calendar_id },
      { $set: { location: req.body.location } }
    );

    res.json({
      Status: 'ok',
      location: req.body.location,
    });
    return;
  }
);

router.get('/:calendar_id/location', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
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
        Error:
          'Calendar does not exist or you do not have access to this calendar',
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
          Error:
            'The calendar does not exist or you do not have access to this calendar',
        });
        return;
      }
    }

    res.json({
      Status: 'ok',
      location: cal.location,
    });
  }
);

module.exports = router;
