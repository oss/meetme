const express = require('express');
const router = express.Router();
const Calendar_schema_main = require('./calendar_schema_main');
const User_schema = require('../user/user_schema');
const mongoose = require('mongoose');
const Org_schema = require('../organizations/organization_schema');
const { isAuthenticated } = require('../auth/passport/util');
const User = require('../user/user_schema');
const { traceLogger, _baseLogger } = require('#logger');

//creates new calendars
router.post('/:calendar_id/meetme', isAuthenticated, async function (req, res) {
  const calendar_id = req.params.calendar_id;
  if (
    req.body === undefined ||
    req.body.timezone === null ||
    req.body.timezone === undefined
  ) {
    res.json({
      Status: 'error',
      error: 'invalid body',
    });
    return;
  }
  const timezone_settings = {
    timeZone: req.body.timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  const final_time_array = [];
  let time_array = {
    date: null,
    iso_string: null,
    times: [],
  };
  if (timezone_settings === undefined || timezone_settings === null) {
    res.json({
      Status: 'error',
      error: 'No timezone',
    });
    return;
  }

  const calendar_data = await Calendar_schema_main.findOne({
    _id: calendar_id,
    $or: [
      { 'owner._id': req.user.uid },
      { 'owner.owner_type': 'organization' },
      { 'users._id': req.user.uid },
      { 'viewers._id': req.user.uid },
    ],
  });

  if (calendar_data === null) {
    res.json({
      Status: 'error',
      error:
        'The calendar does not exist or you do not have permission to access this calendar',
    });
    return;
  }

  if (calendar_data.owner.owner_type === 'organization') {
    const org_owner = await Org_schema.findOne({
      _id: calendar_data.owner._id,
      $or: [
        { owner: req.user.uid },
        { 'admins._id': req.user.uid },
        { 'editors._id': req.user.uid },
        { 'members._id': req.user.uid },
        { 'viewers._id': req.user.uid },
      ],
    });

    if (org_owner === null) {
      res.json({
        Status: 'error',
        error:
          'The calendar does not exist or you do not have permission to access this calendar',
      });
      return;
    }
  }

  //let firstday = new Date(100, { timeZone: 'UTC' });
  //let lastday = new Date(100, {timeZone: timezone});
  //let days = Math.ceil((lastday-firstday)/86400000);
  //    time_array.date = firstday.toLocaleString('en-US', timezone_settings);
  // time_array.iso_string = firstday.toISOString();

  const users = calendar_data.users;

  traceLogger.verbose("fetched users of calendar", req, { uid: req.user.uid, owner: calendar_data.owner, calendar_id: calendar_id, users: calendar_data.users });
  res.json({
    Status: 'ok',
    users: calendar_data.users,
  });
});

router.post('/:calendar_id/meetme/me',
  isAuthenticated,
  async function (req, res) {
    const calendar_id = req.params.calendar_id;
    if (
      req.body === undefined ||
      req.body.timezone === null ||
      req.body.timezone === undefined
    ) {
      res.json({
        Status: 'error',
        error: 'invalid body',
      });
      return;
    }
    const timezone_settings = {
      timeZone: req.body.timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };

    if (timezone_settings === undefined || timezone_settings === null) {
      res.json({
        Status: 'error',
        error: 'No timezone',
      });
      return;
    }

    const calendar_data = await Calendar_schema_main.findOne({
      _id: calendar_id,
      $or: [
        { 'owner._id': req.user.uid },
        { 'owner.owner_type': 'organization' },
        { 'users._id': req.user.uid },
      ],
    });

    /*
    {
        times: {
            $elemMatch: {
                _id: req.user.uid
            }
        }
    }
    */

    if (calendar_data === null) {
      res.json({
        Status: 'error',
        error:
          'The calendar does not exist or you do not have permission to access this calendar',
      });
      return;
    }

    if (calendar_data.owner.owner_type === 'organization') {
      const org_owner = await Org_schema.findOne({
        _id: calendar_data.owner._id,
        $or: [
          { owner: req.user.uid },
          { 'admins._id': req.user.uid },
          { 'editors._id': req.user.uid },
          { 'members._id': req.user.uid },
          { 'viewers._id': req.user.uid },
        ],
      });

      if (org_owner === null) {
        res.json({
          Status: 'error',
          error:
            'The calendar does not exist or you do not have permission to access this calendar',
        });
        return;
      }
    }

    const calendar_data_sending = await Calendar_schema_main.aggregate([
      {
        $match: {
          _id: calendar_id,
        },
      },
      {
        $addFields: {
          timeline: {
            $filter: {
              input: '$users',
              as: 'item',
              cond: {
                $eq: ['$$item._id', req.user.uid],
              },
            },
          },
        },
      },
      {
        $project: {
          timeline: 1,
        },
      },
    ]);

    traceLogger.verbose("set user's timeline for calendar", req, { uid: req.user.uid, owner: calendar_data.owner, calendar_id: calendar_id, timeline: calendar_data_sending });
    res.json({
      Status: 'ok',
      timeline: calendar_data_sending,
    });
});

module.exports = router;
