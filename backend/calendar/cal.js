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

//TODO: delete calendar for org schema
//TODO: implement /dump

router.post('/', isAuthenticated, async function (req, res) {
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
  if (owner === undefined) {
    const netid = req.user.uid;
    owner = { type: 'individual', id: netid };
  }

  console.log(JSON.stringify(owner));
  if (
    !JSON.stringify(owner).match(
      '{"type":"(?:individual|organization)","id":"[a-zA-Z0-9]+"}'
    )
  ) {
    res.json({
      Status: 'error',
      error: 'Invalid owner syntax',
    });
    return;
  }

  //verify owner data is ok and able to create calendar
  if (owner.type === 'individual') {
    if (owner.id !== req.user.uid) {
      res.json({
        Status: 'error',
        error: 'Owner does not match session',
      });
      return;
    }
    const netid = owner.id;
  } else {
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
  if (timeblocks === undefined) {
    res.json({
      Status: 'error',
      error: 'Must have timeblock',
    });
    return;
  }

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
    const calendar_maindata = new Calendar_schema_main();
    const calendar_metadata = new Calendar_schema_meta();

    const calendar_id = createHash('sha256')
      .update(new Date().getTime().toString() + owner.owner_id)
      .digest('hex');
    calendar_maindata._id = calendar_id;
    calendar_metadata._id = calendar_id;

    calendar_metadata.name = req.body.name || 'untitled';
    calendar_metadata.location = req.body.location || null;
    calendar_metadata.description = [];
    calendar_maindata.links = [];
    calendar_metadata.public = req.body.public || false; //false by default

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
    calendar_maindata.meetingTime = {
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
    const cal = await Calendar_schema_main.findOne({ _id: calendar_id });
    if (cal === null) {
      res.json({
        Status: 'error',
        error: 'No calendar found',
      });
      return;
    }

    if (cal.owner.owner_type === 'individual') {
      if (req.user.uid === cal.owner._id) {
        //delete calendar from database
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
      } else {
        res.json({
          Status: 'error',
          error: 'Not able to delete calendar',
        });
        return;
      }
    } else {
      //org delete need to implement
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
    return;
  } catch (e) {
    console.log(e);
    res.json({
      Status: 'error',
      error: JSON.stringify(e),
    });
  }
});

/*

router.get('/:calendar_id/dump', isAuthenticated, async function (req, res) {

    MEANT TO DO BOTH /meta and /main in 1 call
    implement later not required

});

*/

router.get('/:calendar_id/meta', isAuthenticated, async function (req, res) {
  //individual cal or made time in org cal
  const cal_meta = await Calendar_schema_meta.findOne(
    { _id: req.params.calendar_id },
    { __v: 0 }
  );

  if (cal_meta === null) {
    res.json({
      Status: 'error',
      error:
        'This calendar does not exist or you do not have access to this calendar',
    });
    return;
  }

  if (cal_meta.owner.owner_type === 'individual') {
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
          'This calendar does not exist or you do not have access to this calendar',
      });
      return;
    }
    res.json({
      Status: 'ok',
      metadata: cal_meta,
    });
  } else {
    //org
    const org = await Org_schema.findOne({
      _id: cal_meta.owner._id,
      $or: [
        { owner: { _id: req.user.uid } },
        { editors: { _id: req.user.uid } },
        { members: { _id: req.user.uid } },
        { viewers: { _id: req.user.uid } },
      ],
    });

    if (org === null)
      if (
        (await User_schema.findOne({
          _id: req.user.uid,
          'calendars._id': req.params.calendar_id,
        })) === null
      )
        //owner is org but shared based on individual
        res.json({
          Status: 'error',
          error:
            'The calendar does not exist or you do not have access to this calendar',
        });
      else
        res.json({
          Status: 'ok',
          metadata: cal_meta,
        });
    else
      res.json({
        Status: 'ok',
        metadata: cal_meta,
      });
  }
});

router.get('/:calendar_id/main', isAuthenticated, async function (req, res) {
  const maindata = await Calendar_schema_main.findOne({
    _id: req.params.calendar_id,
  });
  if (maindata === null) {
    res.json({
      Status: 'error',
      error:
        'The calendar does not exist or you do not have access to this calendar',
    });

    return;
  }

  if (maindata.owner.owner_type === 'individual') {
    const usr = await User_schema.findOne({
      _id: req.user.uid,
      'calendars._id': req.params.calendar_id,
    });
    if (usr === null) {
      res.json({
        Status: 'error',
        error:
          'Calendar does not exist or you do not ave access to this calendar',
      });
      return;
    }
    res.json({
      Status: 'ok',
      maindata: maindata,
    });
  } else {
    //org
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
      )
        res.json({
          Status: 'error',
          error:
            'The calendar does not exist or you do not have access to this calendar',
        });
      else
        res.json({
          Status: 'ok',
          metadata: await Calendar_schema_meta.findOne({
            _id: req.params.calendar_id,
          }),
        });
    } else
      res.json({
        Status: 'ok',
        maindata: maindata,
      });
  }
});

router.get('/:calendar_id/links', isAuthenticated, async function (req, res) {
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
  } catch (e) {
    res.json({
      Status: 'error',
      error: 'backend error occured',
    });
  }
});

/*
router.patch('/:calendar_id/leave', isAuthenticated, async function (req, res) {
    const cal_id = req.params.calendar_id;
    const uid = req.user.uid;

    if (!uid.toString().match(req.user.uid)) {
        res.json({
            Status: "error",
            error: "Incorrect target users payload"
        });
        return;
    }

    const target_cal = await Calendar_schema_main.findOne({
        _id: cal_id, $or: [
            { owner: req.user.uid },
            { admins: { _id: req.user.uid } }
        ]
    });

    if (target_cal === null) {
        res.json({
            Status: 'error',
            error: 'The calendar does not exist or you do not have access to share'
        });
        return;
    }

    await Calendar_schema_main.updateOne({ _id: cal_id }, {
        $pull: {
            editors: { _id: uid },
            members: { _id: uid },
            viewers: { _id: uid },
        }
    });

    res.json({
        Status: 'ok',
    });
});

router.patch('/:calendar_id/kick', isAuthenticated, async function (req, res){
    res.json({Status: 'error', error: 'not implemented yet'})
});
*/

module.exports = router;
