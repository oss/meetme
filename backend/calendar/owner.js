//todo, check if org/user exists
const express = require('express');
const router = express.Router();
const Calendar_schema_maindata = require('./calendar_schema_main');
const User_schema = require('../user/user_schema');
const mongoose = require('mongoose');
const Org_schema = require('../organizations/organization_schema');
const logger = require('#logger');

//sets a new owner of a calendar
router.patch('/:calendar_id/owner', async function (req, res) {
  const calendar_id = req.params.calendar_id;

  const newowner = req.body;
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
    res.json({
      Status: 'error',
      error: 'invalid body format',
    });
    return;
  }

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
    if ((await User_schema.findOne({ _id: newowner.id })) === null) {
      res.json({
        Stauts: 'error',
        error: 'User has not made an account',
      });
      return;
    }
  } else {
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

  try {
    //not implmeneting for now but all pre-checks good
  } catch (e) {
    res.json({
      Status: 'error',
      error: 'Error occred when updating owner',
    });
    return;
  }

  logger.info("set owner of calendar", req, { uid: req.user.uid, calendar_id: calendar_id, new_owner: newowner });
  res.json({
    Status: 'ok',
  });
});

module.exports = router;
