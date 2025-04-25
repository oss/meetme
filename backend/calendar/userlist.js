const express = require('express');
const router = express.Router();
const Calendar_schema_main = require('./calendar_schema_main');
const Org_schema = require('../organizations/organization_schema');
const User_schema = require('../user/user_schema');
const { isAuthenticated } = require('../auth/passport/util');
const logger = require('#logger');

//gets a list of users in a calendar is used to calculate color for time selections
router.get('/:calendar_id/memberlist', isAuthenticated, async function (req, res) {
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
          'The calendar does not exist or you do not have permission to access this calendar',
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
    const memberlist = [];
    const nin_arr = [];
    if (cal.owner.owner_type === 'individual') {
      memberlist.push({ _id: cal.owner._id, type: 'owner' });
      nin_arr.push(cal.owner._id);
    }
    for (let i = 0; i < cal.viewers.length; i++) {
      memberlist.push({ _id: cal.viewers[i]._id, type: 'viewer' });
      nin_arr.push(cal.viewers[i]._id);
    }

    const all_individual_shared = await User_schema.distinct('_id', {
      'calendars._id': req.params.calendar_id,
      _id: {
        $nin: nin_arr,
      },
    });

    for (let i = 0; i < all_individual_shared.length; i++) {
      memberlist.push({ _id: all_individual_shared[i], type: 'user' });
    }

    logger.info("fetched userlist of calendar", req, { uid: req.user.uid, owner: cal.owner, calendar_id: calendar_id, members: memberlist });
    res.json({
      Status: 'ok',
      memberlist: memberlist,
    });
  }
);

module.exports = router;
