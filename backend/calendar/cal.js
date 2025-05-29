const express = require('express');
const router = express.Router();
const Calendar_schema_main = require('./calendar_schema_main');
const Calendar_schema_meta = require('./calendar_schema_meta');
const Org_schema = require('../organizations/organization_schema');
const mongoose = require('mongoose');
const User_schema = require('../user/user_schema');
const { createHash } = require('crypto');
const { isAuthenticated } = require('../auth/passport/util');
const User = require('../user/user_schema');
const { traceLogger, _baseLogger } = require('#logger');

//TODO: delete calendar for org schema
//TODO: implement /dump

router.post('/', isAuthenticated, async function (req, res) {
  traceLogger.verbose("validating calendar public status...", req, {});
  if (
    req.body.public !== undefined &&
    !req.body.public.toString().match('true|false')
  ) {
    req.json({
      Status: 'error',
      error: 'Need a valid public status',
    });
    return;
  }

  //impemented default name of 'untitled' below, maybe uncomment to add banned names?
  /*
    const name = req.get('name');
    if (name === undefined) {
        res.json({
            Status: "error",
            error: "No name found"
        });
        return;
    }
    */

  let owner = req.body.owner;
  traceLogger.verbose("checking for owner...", req, {});
  if (owner === undefined) {
    traceLogger.verbose("no owner specified, defaulting to requester as owner", req, {});
    const netid = req.user.uid;
    owner = { type: 'individual', id: netid };
  }

  console.log(JSON.stringify(owner));

  //verify owner data is ok and able to create calendar
  if (owner.type === 'individual') {
    traceLogger.verbose("owner is individual, checking if owner is the requester...", req, { owner = owner.id });
    if (owner.id !== req.user.uid) {
      res.json({
        Status: 'error',
        error: 'Owner does not match session',
      });
      return;
    }
    // TODO(ivan): ??????
    const netid = owner.id;
  } else {
    traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: owner.id });
    const target_org = await Org_schema.findOne({
      _id: owner.id,
      $or: [
        { owner: { _id: req.user.uid } },
        { editors: { _id: req.user.uid } },
        { admins: { _id: req.user.uid } },
      ],
    });

    if (target_org === null) {
      res.json({
        Status: 'error',
        error: 'Org not found or not able to add calendar to org',
      });
      return;
    }
  }

  let timeblocks = req.body.timeblocks;
  traceLogger.verbose("checking if timeblocks exist...", req, {});
  if (timeblocks === undefined) {
    res.json({
      Status: 'error',
      error: 'Must have timeblock',
    });
    return;
  }

  traceLogger.verbose("validating timeblocks...", req, {});
  try {
    if (timeblocks.length === 0) {
      res.json({
        Status: 'error',
        error: 'You must have at least 1 duration timeset',
      });
      return;
    }
  } catch (e) {
    console.log(e);
    if (e.name === 'SyntaxError') {
      res.json({
        Status: 'error',
        error: 'Invalid JSON for timeblocks',
      });
      return;
    } else {
      res.json({
        Status: 'error',
        error: 'Json Error occured in timeblock',
      });
      return;
    }
  }

  for (let i = 0; i < timeblocks.length; i++) {
    const timeblock = timeblocks[i];
    if (
      !JSON.stringify(timeblocks[i]).match(
        '{ ?"start": ?[0-9]+ ?, ?"end": ?[0-9]+ ?}'
      )
    ) {
      traceLogger.verbose("invalid timeblock", req, { timeblock: timeblock });
      res.json({
        Status: 'error',
        error: 'Invalid timeblock',
      });
      return;
    }
    if (timeblock.start > timeblock.end) {
      res.json({
        Status: 'error',
        error: 'Timeblock start cannot occur after end',
        Timeblock: { start: timeblock.start, end: timeblock.end },
      });
      return;
    }
    if (i !== 0) {
      const timeblock_prev = timeblocks[i - 1];
      const timeblock_current = timeblocks[i];
      if (timeblock_prev.end > timeblock_current.start) {
        res.json({
          Status: 'error',
          error: 'Timeblock conflict',
          Conflict: {
            before: timeblock_prev,
            after: timeblock_current,
          },
        });
        return;
      }
    }
  }

  try {
    traceLogger.verbose("inserting calendar...", req, {});
    const calendar_maindata = new Calendar_schema_main();
    const calendar_metadata = new Calendar_schema_meta();

    const calendar_id = createHash('sha512')
      .update(new Date().getTime().toString() + owner.owner_id + Math.random())
      .digest('base64url');
    calendar_maindata._id = calendar_id;
    calendar_metadata._id = calendar_id;

    calendar_metadata.name = req.body.name || 'untitled';
    calendar_metadata.location = req.body.location || null;
    calendar_metadata.created = new Date().getTime();
    calendar_metadata.modified = new Date().getTime();
    calendar_metadata.description = [];
    calendar_maindata.links = [];
    calendar_metadata.public = req.body.public || false; //false by default
    calendar_metadata.shareLink = req.body.public || false; //false by default

    //TODO: doubel check that owner and org id match
    calendar_maindata.owner = {
      owner_type: owner.type,
      _id: owner.id,
    };
    calendar_metadata.owner = {
      owner_type: owner.type,
      _id: owner.id,
    };
    calendar_maindata.blocks = timeblocks;
    calendar_metadata.meetingTime = {
      start: null,
      end: null,
    };

    if (owner.type === 'individual') {
      calendar_maindata.users = [
        {
          _id: owner.id,
          times: [],
        },
      ];
      await User_schema.updateOne(
        { _id: req.user.uid },
        { $push: { calendars: { _id: calendar_id } } }
      );
    } else {
      calendar_maindata.users = [];
      await Org_schema.updateOne(
        { _id: owner.id },
        { $push: { calendars: { _id: calendar_id } } }
      );
    }

    await calendar_metadata.save();
    await calendar_maindata.save();

    const recieved_meta = await Calendar_schema_meta.findOne(
      calendar_metadata,
      { __v: 0 }
    );
    const recieved_main = await Calendar_schema_main.findOne(
      calendar_maindata,
      { __v: 0 }
    );

    res.json({
      Status: 'ok',
      calendar: { ...recieved_meta, ...recieved_main }._doc, //idk what ._doc does but it gives us what we need
    });
    traceLogger.verbose("created calendar", req, { calendar_id: calendar_id });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      Status: 'error',
      error: 'Backend issue occured',
    });
  }
});

router.delete('/:calendar_id', isAuthenticated, async function (req, res) {
  const calendar_id = req.params.calendar_id;
  try {
    traceLogger.verbose("finding calendar...", req, {});
    const cal = await Calendar_schema_main.findOne({ _id: calendar_id });
    if (cal === null) {
      res.json({
        Status: 'error',
        error: 'No calendar found',
      });
      return;
    }

    if (cal.owner.owner_type === 'individual') {
      traceLogger.verbose("owner is indvidual checking if user is owner...", req, {});
      if (req.user.uid === cal.owner._id) {
        //delete calendar from database
	traceLogger.verbose("deleting calendar...", req, {});
        await Calendar_schema_main.deleteOne({ _id: calendar_id });
        await Calendar_schema_meta.deleteOne({ _id: calendar_id });

        await User_schema.updateOne(
          { _id: req.user.uid },
          { $pull: { calendars: { _id: calendar_id } } }
        );
        //remove calendar from all users
        await User_schema.updateMany(
          { _id: { $in: cal.users.map((value) => value._id) } },
          { $pull: { calendars: { _id: calendar_id } } }
        );
        //remove all viewers
        await User_schema.updateMany(
          { _id: { $in: cal.viewers.map((value) => value._id) } },
          { $pull: { calendars: { _id: calendar_id } } }
        );
        await User_schema.updateMany(
          { _id: { $in: cal.pendingUsers.map((value) => value._id) } },
          { $pull: { pendingCalendars: { _id: calendar_id } } }
        );
	traceLogger.verbose("deleted calendar", req, { calendar_id: calendar_id });
      } else {
	traceLogger.verbose("unable to delete calender, user is not owner", req, { owner: cal.owner_id });
        res.json({
          Status: 'error',
          error: 'Not able to delete calendar',
        });
        return;
      }
    } else {
      //org delete need to implement
      traceLogger.verbose("owner is org, checking if user has permission to delete...", req, { owner: cal.owner_id });
      const allow = await Org_schema.findOne({
        _id: cal.owner._id,
        $or: [{ owner: req.user.uid }, { 'admins._id': req.user.uid }],
      });
      if (allow === null) {
        res.json({
          Status: 'error',
          error:
            'you cannot delete this calendar because you do not have appropriate permissions',
        });
        return;
      }

      traceLogger.verbose("deleting calendar...", req, {});
      //delete cal from org
      await Org_schema.updateOne(
        { _id: cal.owner._id },
        { $pull: { calendars: { _id: calendar_id } } }
      );
      //delete calendar from database
      await Calendar_schema_main.deleteOne({ _id: calendar_id });
      await Calendar_schema_meta.deleteOne({ _id: calendar_id });

      //delete all individually shared users in org calendar
      await User_schema.updateOne(
        { _id: req.user.uid },
        { $pull: { calendars: { _id: calendar_id } } }
      );
      //remove calendar from all users
      await User_schema.updateMany(
        { _id: { $in: cal.users._id } },
        { $pull: { calendars: { _id: calendar_id } } }
      );
      //remove all viewers
      await User_schema.updateMany(
        { _id: { $in: cal.viewers._id } },
        { $pull: { calendars: { _id: calendar_id } } }
      );
      await User_schema.updateMany(
        { _id: { $in: cal.pendingUsers._id } },
        { $pull: { pendingCalendars: { _id: calendar_id } } }
      );
    }
    res.json({ Status: 'ok' });
    traceLogger.verbose("deleted calendar", req, { calendar_id: calendar_id });
    return;
  } catch (e) {
    console.log(e);
    res.json({
      Status: 'error',
      error: JSON.stringify(e),
    });
  }
});

router.get('/:calendar_id/meta', isAuthenticated, async function (req, res) {
  traceLogger.verbose("finding calendar...", req, { calendar_id: req.params.calendar_id });
  //individual cal or made time in org cal
  const cal_meta = await Calendar_schema_meta.findOne(
    { _id: req.params.calendar_id },
    { __v: 0 }
  );

  if (cal_meta === null) {
    res.json({
      Status: 'error',
      error:
        'Calendar does not exist or you do not have access to this calendar',
    });
    return;
  }

  if (cal_meta.owner.owner_type === 'individual') {
    traceLogger.verbose("owner is individual, checking if calendar is owned by requester...", req, {});
    const usr = await User_schema.findOne({
      _id: req.user.uid,
      $or: [
        { 'calendars._id': req.params.calendar_id },
        { 'pendingCalendars._id': req.params.calendar_id },
      ],
    });
    if (usr === null) {
      res.json({
        Status: 'error',
        error:
          'Calendar does not exist or you do not have access to this calendar',
      });
      return;
    }
    res.json({
      Status: 'ok',
      metadata: cal_meta,
    });
  } else {
    //org
    traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: cal_meta.owner._id });
    const org = await Org_schema.findOne({
      _id: cal_meta.owner._id,
      $or: [
        { owner: { _id: req.user.uid } },
        { editors: { _id: req.user.uid } },
        { members: { _id: req.user.uid } },
        { viewers: { _id: req.user.uid } },
      ],
    });

    if (org === null) {
      traceLogger.verbose("requester is not in org, but checking if calendar is shared with requester...", req, {});
      if (
        (await User_schema.findOne({
          _id: req.user.uid,
          'calendars._id': req.params.calendar_id,
        })) === null
      ) {
        //owner is org but shared based on individual
        res.json({
          Status: 'error',
          error:
            'Calendar does not exist or you do not have access to this calendar',
        });
	return;
      } else {
        res.json({
          Status: 'ok',
          metadata: cal_meta,
        });
      }
    } else {
      res.json({
        Status: 'ok',
        metadata: cal_meta,
      });
    }
  }
  traceLogger.verbose("fetched calendar meta", req, { calendar_id: req.params.calendar_id });
});

router.get('/:calendar_id/main', isAuthenticated, async function (req, res) {
  traceLogger.verbose("finding calendar...", req, { calendar_id: req.params.calendar_id });
  const maindata = await Calendar_schema_main.findOne({
    _id: req.params.calendar_id,
  });
  if (maindata === null) {
    res.json({
      Status: 'error',
      error:
        'Calendar does not exist or you do not have access to this calendar',
    });

    return;
  }

  if (maindata.owner.owner_type === 'individual') {
    traceLogger.verbose("owner is individual, checking if calendar is owned by requester...", req, {});
    const usr = await User_schema.findOne({
      _id: req.user.uid,
      'calendars._id': req.params.calendar_id,
    });
    if (usr === null) {
      res.json({
        Status: 'error',
        error:
          'Calendar does not exist or you do not have access to this calendar',
      });
      return;
    }
    res.json({
      Status: 'ok',
      maindata: maindata,
    });
  } else {
    //org
    traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: maindata.owner._id });
    const org = await Org_schema.findOne({
      _id: maindata.owner._id,
      $or: [
        { owner: { _id: req.user.uid } },
        { editors: { _id: req.user.uid } },
        { members: { _id: req.user.uid } },
        { viewers: { _id: req.user.uid } },
      ],
    });
    if (org === null) {
      if (
        (await User_schema.findOne({
          _id: req.user.uid,
          'calendars._id': req.params.calendar_id,
        })) === null
      ) {
        res.json({
          Status: 'error',
          error:
            'Calendar does not exist or you do not have access to this calendar',
        });
	return;
      } else {
        res.json({
          Status: 'ok',
          maindata: maindata,
        });
      }
    } else
      res.json({
        Status: 'ok',
        maindata: maindata,
      });
  }
  traceLogger.verbose("fetched calendar main", req, { calendar_id: req.params.calendar_id });
});

router.get('/:calendar_id/links', isAuthenticated, async function (req, res) {
  res.json({
    Status: 'error',
    error:
    'Not implemented',
  });
  return;
  try {
    const links = await Calendar_schema_main.aggregate([
      {
        $unwind: '$_id',
      },
      {
        $match: { links },
      },
      {
        $group: { _id: '$_id' },
      },
    ]);
    if (links === null) {
      res.json({
        Status: 'error',
        error:
          'Calendar does not exist or you do not have access to this calendar',
      });
      return;
    }
    res.json({
      Status: 'ok',
      calendar: links,
    });
    traceLogger.verbose("fetched calendar links", req, { uid: req.user.uid, calendar_id: req.params.calendar_id });
  } catch (e) {
    res.json({
      Status: 'error',
      error: 'backend error occured',
    });
  }
});

module.exports = router;
