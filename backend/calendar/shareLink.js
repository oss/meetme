const express = require('express');
const router = express.Router();
const User_schema = require('../user/user_schema');
const Org_schema = require('../organizations/organization_schema');
const Calendar_schema_meta = require('./calendar_schema_meta');
const { isAuthenticated } = require('../auth/passport/util');
const User = require('../user/user_schema');

//renames calendars
router.patch('/:calendar_id/shareLink', isAuthenticated, async function (req, res) {
    const calendar_id = req.params.calendar_id;
    if (req.body.shareLink === undefined || req.body.shareLink === null) {
      res.json({
        Status: 'error',
        error: 'No status provided',
      });
      return;
    }

    if( typeof req.body.shareLink !== 'boolean'){
        res.json({
            Status: 'error',
            error: 'shareLink is not bool'
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
          error:
            'The calendar does not exist or you do not have access to modify this calendar',
        });
        return;
      }
    }

    await Calendar_schema_meta.updateOne(
      { _id: calendar_id },
      { $set: { shareLink: req.body.shareLink } }
    );

    res.json({
      Status: 'ok',
      shareLink: req.body.shareLink,
    });
    return;
  }
);

router.get('/:calendar_id/shareLink', isAuthenticated, async function (req, res) {
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
            'The calendar does not exist or you do not have access to this calendar',
        });
        return;
      }
    }

    res.json({
      Status: 'ok',
      shareLink: cal.shareLink,
    });
  }
);

module.exports = router;
