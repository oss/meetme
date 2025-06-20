//todo add removal + add funcionality
const express = require('express');
const router = express.Router();
const Calendar_schema_main = require('./calendar_schema_main');
const Calendar_schema_meta = require('./calendar_schema_meta');
const User_schema = require('../user/user_schema');
const mongoose = require('mongoose');
const Org_schema = require('../organizations/organization_schema');
const { traceLogger, _baseLogger } = require('#logger');

router.patch('/:calendar_id/me', async function (req, res) {
  const calendar_id = req.params.calendar_id;
  const mode = req.body.mode;
  traceLogger.verbose("validating operation...", req, { operation: mode });
  if (mode === undefined || !mode.toString().match('add|subtract|replace')) {
    res.json({
      Status: 'error',
      error: 'Invalid operation',
    });
    return;
  }
  const timeblocks = req.body.timeblocks;

  switch (mode) {
    case 'add':
      await addmode();
      break;
    case 'subtract':
      await submode();
      break;
    case 'replace':
      traceLogger.verbose("replace mode", req, { });
      for (let i = 0; i < timeblocks.length; i++) {
        if (timeblocks[i] == null) {
          return res.json({
            Status: 'error',
            error: `Timeblocks at index ${i} is null.`,
          });
        }
        if (timeblocks[i].start >= timeblocks[i].end) {
          res.json({
            Status: 'error',
            error: 'Invalid timeblocks',
            timeblock: timeblocks[i].start,
          });
          return;
        }
        if (
          !JSON.stringify(timeblocks[i]).match(
            '{ ?"start": ?[0-9]+ ?, ?"end": ?[0-9]+ ?}'
          )
        ) {
          res.json({
            Status: 'error',
            error: 'Invalid timeblock',
            timeblock: timeblocks[i],
          });
          return;
        }
        if (
          timeblocks[i].start % (1000 * 60) !== 0 ||
          timeblocks[i].end % (1000 * 60) !== 0
        ) {
          res.json({
            Status: 'error',
            error: 'not a full minute',
            timeblock: timeblocks[i],
          });
          return;
        }
      }

      for (let i = 1; i < timeblocks.length; i++) {
        if (timeblocks[i - 1].end > timeblocks[i].start) {
          res.json({
            Status: 'error',
            error: 'Invalid times',
            timeblock: [
              { index: i - 1, end: timeblocks[i - 1].end },
              { index: i, start: timeblocks[i].start },
            ],
          });
          return;
        }
      }

      await repmode(req, req.user.uid, calendar_id, res, timeblocks);

      break;
  }
});

async function addmode() {
  return;
}

async function submode() {
  return;
}

async function repmode(req, netid, calendar_id, res, timeblocks) {
    mongoose.connection().transaction(async () => {
	const calendarMetadata = await Calendar_schema_meta.findOne({
	    _id: calendar_id
	});

	if (calendarMetadata.owner.owner_type == "individual") {
	    traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: calendar_id });
	    const calendar = await Calendar_schema_main.findOne({
		_id: calendar_id,
		'users._id': netid,
	    });

	    if (calendar === null) {
		res.json({
		    Status: 'error',
		    error: 'No valid calendar found',
		});
		return;
	    }

	    //db.calendars.update({_id: "d386808522386e75936c35583dc668eff5be278bbef9f5ab392b636f922080f0", 'users.netid': 'abcd'},{$set: {'users.$.netid': "test2"}})
	    await Calendar_schema_main.updateOne(
		{ _id: calendar_id, 'users._id': netid },
		{ $set: { 'users.$.times': timeblocks } }
	    );


	    //update modified time in the metadata
	    const current_time = new Date().getTime()
	    await Calendar_schema_meta.updateOne(
		{ _id: calendar_id },
		{ $set: { modified: current_time} }
	    );

	    res.json({
		Status: 'ok',
	    });
	} else if (calendarMetadata.owner.owner_type == "organization") {
	    traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: calendarMetadata.owner._id });
	    const ownerOrg = await Org_schema.findOne({
		_id: calendarMetadata.owner._id,
	    })

	    if (ownerOrg == null){
		return res.json({
		    Status:"Calendar's owner is an organization, but does not exist anymore",
		})
	    }
	    let hasEditPermission = ownerOrg.members.some(member=>member._id==netid) || ownerOrg.owner==netid;
	    if (hasEditPermission) {
		// if the user does not exist in the current array of users, then add it and then set the timeblocks
		// if the user already exists, then just set the timeblocks

		// TODO: have to change this to one query instead of two seperate querys. Not sure if it is possible.
		const calendar = await Calendar_schema_main.findOne({
		    _id: calendar_id,
		    'users._id': netid,
		});
		if (calendar === null) {
		    await Calendar_schema_main.updateOne(
			{ _id: calendar_id },
			{ $push: { users: { _id: netid, times: timeblocks } } }
		    );
		} else {
		    await Calendar_schema_main.updateOne(
			{ _id: calendar_id, 'users._id': netid },
			{ $set: { 'users.$.times': timeblocks } }
		    );
		}

		const current_time = new Date().getTime()

		//update modified time in the metadata
		await Calendar_schema_meta.updateOne(
		    { _id: calendar_id },
		    { $set: { modified: current_time} }
		);

		traceLogger.verbose("updated user timeblocks for calendar", req, { calendar_id: calendar_id, timeblocks: timeblocks });
		res.json({
		    Status: 'ok',
		});
	    } else {
		res.json({
		    Status: 'error',
		    error: 'you do not have permissions to update this calendar',
		});
	    }
	}
    });
}

module.exports = router;
