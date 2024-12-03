const express = require('express');
const router = express.Router();
const User_schema = require('../user/user_schema');
const Org_schema = require('../organizations/organization_schema');
const Calendar_schema_main = require('./calendar_schema_main');
const Calendar_schema_meta = require('./calendar_schema_meta');
const { isAuthenticated } = require('../auth/passport/util');

//renames calendars
router.patch('/:calendar_id/meet_time', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
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
      res.json({
        Status: 'error',
        error: 'Start/End time conflict',
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

    await Calendar_schema_meta.updateOne(
      { _id: calendar_id },
      { $set: { meetingTime: meeting_time } }
    );

    res.json({
      Status: 'ok',
      time: meeting_time,
    });
    return;
  }
);

router.get('/:calendar_id/meet_time',isAuthenticated,async function (req, res) {
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
          error:
            'The calendar does not exist or you do not have access to modify this calendar',
        });
        return;
      }
    }

    res.json({
      Status: 'ok',
      meeting_time: cal.meetingTime,
    });
  }
);

module.exports = router;
