const express = require('express');
const router = express.Router();
const Calendar_schema_main = require('./calendar_schema_main');
const Calendar_schema_meta = require('./calendar_schema_meta');
const User_schema = require('../user/user_schema');
const mongoose = require('mongoose');
const Org_schema = require('../organizations/organization_schema');
const { isAuthenticated } = require('../auth/passport/util');
const { valid_netid } = require('../auth/util/LDAP_utils');
const { create_user_netid } = require('../user/helpers/modify_user');
const { traceLogger, _baseLogger } = require('#logger');

//invite users
router.patch('/:calendar_id/share', isAuthenticated, async function (req, res) {
    const new_users = req.body.new_users;
    traceLogger.verbose("validating parameters...", req, { new_users: new_users });
    if (new_users === undefined || new_users === null) {
        res.json({
            Status: 'error',
            error: 'No users found',
        });
        return;
    }

    if (new_users.length === 0) {
        res.json({
            Status: 'error',
            error: 'new_users is empty',
        });
        return;
    }

    if (!JSON.stringify(new_users).match('(?:"[a-zA-Z0-9]+",?)+')) {
        res.json({
            Status: 'error',
            error: 'Invalid new_user syntax',
        });
        return;
    }

    traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: req.params.calendar_id });
    const calendar = await Calendar_schema_main.findOne({
        _id: req.params.calendar_id,
        $or: [
            {
                owner: {
                    owner_type: 'individual',
                    _id: req.user.uid,
                },
            },
            { 'owner.owner_type': 'organization' },
        ],
    });

    //individual check
    if (calendar === null) {
        res.json({
            Status: 'error',
            error:
                'calendar does not exist or you do not have permission to modify this calendar',
        });
        return;
    }

    if (calendar.owner.owner_type === 'organization') {
	traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: calendar.owner._id });
        // temporary ---> cannot share calendars bound to organizations with individuals
        return res.json({
            Status: 'error',
            error:
                'You do not have permissions to share, organization check failed',
        });

        // let org_info = await Org_schema.findOne({
        //   _id: req.params.calendar.owner._id,
        //   $or: [{ "admins._id": req.user.uid }, { owner: req.user.uid }],
        // });
        // //org check
        // if (org_info === null) {
        //   res.json({
        //     Status: 'error',
        //     Error:
        //       'Calendar does not exist or you do not have permissions to share, organization check failed',
        //   });
        //   return;
        // }
    }

    const payload = {
        already_added: [],
        added: [],
        not_added: [],
    };

    traceLogger.verbose("creating payload...", req, {});
    for (let i = 0; i < new_users.length; i++) {
        const new_user = new_users[i];
        if (!(await valid_netid(new_user))) {
	    traceLogger.verbose("invalid net id, skip adding to payload", req, { user: new_user });
            payload.not_added.push(new_user);
            continue;
        }

        const usr = await User_schema.findOne({ _id: new_user });
        if (usr === null) {
	    traceLogger.verbose("no user found, creating account for use...", req, { user: new_user });
            await create_user_netid(new_user);
	    traceLogger.verbose("user account created and added to payload", req, {});
            payload.added.push(new_user);
            calendar.pendingUsers.push({ _id: new_user });
            continue;
        }
        if (
            usr.calendars.some((item) => {
                return item._id === req.params.calendar_id;
            })
        ) {
	    traceLogger.verbose("already shared with user", req, { user: new_user });
            payload.already_added.push(new_user);
	} else if (
            usr.pendingCalendars.some((item) => {
                return item._id === req.params.calendar_id;
            })
        ) {
	    traceLogger.verbose("already shared with user (pending)", req, { user: new_user });
            payload.already_added.push(new_user);
	} else {
	    traceLogger.verbose("added user to payload", req, { user: new_user });
            payload.added.push(new_user);
            calendar.pendingUsers.push({ _id: new_user });
        }
    }

    traceLogger.verbose("updating calendar...", req, {});
    await calendar.save();
    traceLogger.verbose("updating users...", req, {});
    await User_schema.updateMany(
        { _id: { $in: payload.added } },
        { $push: { pendingCalendars: { _id: req.params.calendar_id } } }
    );

    traceLogger.verbose("added users to calendar", req, { calendar_id: calendar_id, payload: payload });
    res.json({
        Status: 'ok',
        user_list: payload,
    });
});

//remove users
router.delete('/:calendar_id/share', isAuthenticated, async function (req, res) {
    /*
        body: {target_users:["netid1","netid2",...]}
    */
    const target_users = req.body.target_users;
    traceLogger.verbose("validating parameters...", req, { users: target_users });
    if (target_users === undefined || target_users === null) {
        res.json({
            Status: 'error',
            error: 'No users found',
        });
        return;
    }

    if (target_users.length === 0) {
        res.json({
            Status: 'error',
            error: 'target_users is empty',
        });
        return;
    }

    if (!JSON.stringify(target_users).match('(?:"[a-zA-Z0-9]+",?)+')) {
        res.json({
            Status: 'error',
            error: 'Invalid target_user syntax',
        });
        return;
    }

    traceLogger.verbose("checking if calendar exists or if user has permission...", req, { calendar_id: req.params.calendar_id });
    const calendar = await Calendar_schema_main.findOne({
        _id: req.params.calendar_id,
        $or: [
            {
                owner: {
                    owner_type: 'individual',
                    _id: req.user.uid,
                },
            },
            { 'owner.owner_type': 'organization' },
        ],
    });

    //individual check
    if (calendar === null) {
        res.json({
            Status: 'error',
            error:
                'calendar does not exist or you do not have permission to modify this calendar',
        });
        return;
    }

    let org_info = null;
    if (calendar.owner.owner_type === 'organization') {
	traceLogger.verbose("owner is org, checking if requester has permission...", req, { org: calendar.owner._id });
        org_info = await Org_schema.findOne({
            _id: req.params.calendar_id,
            $or: [{ admins: { _id: req.user.uid } }, { owner: req.user.uid }],
        });
        //org check
        if (org_info === null) {
            res.json({
                Status: 'error',
                error:
                    'Calendar does not exist or you do not have permissions to share',
            });
            return;
        }
    }

    const payload = {
        removed: [],
        not_removed: [],
    };

    traceLogger.verbose("creating payload...", req, {});
    //org check mode
    if (org_info !== null) {
	traceLogger.verbose("org delete mode...", req, {});
        for (let i = 0; i < target_users.length; i++) {
            const new_user = target_users[i];
            if (
                new_user === org_info.owner._id ||
                org_info.admins.some((item) => {
                    return item._id === new_user;
                })
            ) {
		traceLogger.verbose("user is owner, skipping...", req, { user: new_user });
                payload.not_removed.push(new_user);
                continue;
            } else {
		traceLogger.verbose("added user for removal", req, { user: new_user });
		payload.removed.push(new_user);
	    }
        }
    } else {
	traceLogger.verbose("indvidual delete mode...", req, {});
        for (let i = 0; i < target_users.length; i++) {
            const new_user = target_users[i];
            if (new_user === calendar.owner._id) {
		traceLogger.verbose("user is owner, skipping...", req, { user: new_user });
		payload.not_removed.push(new_user);
	    } else { 
		traceLogger.verbose("added user for removal", req, { user: new_user });
		payload.removed.push(new_user);
	    }
        }
    }

    traceLogger.verbose("updating calendar...", req, {});
    await Calendar_schema_main.updateOne(
        { _id: req.params.calendar_id },
        { $pull: { users: { _id: { $in: payload.removed } } } }
    );
    traceLogger.verbose("updating users...", req, {});
    await User_schema.updateMany(
        { _id: { $in: payload.removed } },
        { $pull: { calendars: { _id: req.params.calendar_id } } }
    );

    traceLogger.verbose("removed users from calendar", req, { calendar_id: calendar_id, payload: payload });
    res.json({
        Status: 'ok',
        user_list: payload,
    });
});

//accept invite
router.patch('/:calendar_id/accept', isAuthenticated, async function (req, res) {
    traceLogger.verbose("checking if requester has been invited...", req, { calendar_id: req.params.calendar_id });
    const calendar = await Calendar_schema_main.findOne({
        _id: req.params.calendar_id,
        'pendingUsers._id': req.user.uid,
    });

    //individual check
    if (calendar === null) {
        res.json({
            Status: 'error',
            error:
                'You have not been invited to this calendar or this calendar does not exist',
        });
        return;
    }

    traceLogger.verbose("updating calendar...", req, {});
    await Calendar_schema_main.updateOne(
        { _id: req.params.calendar_id },
        {
            $pull: { pendingUsers: { _id: req.user.uid } },
            $push: { users: { _id: req.user.uid, times: [] } },
        }
    );

    traceLogger.verbose("updating user...", req, {});
    await User_schema.updateOne(
        { _id: req.user.uid },
        {
            $pull: { pendingCalendars: { _id: req.params.calendar_id } },
            $push: { calendars: { _id: req.params.calendar_id } },
        }
    );

    traceLogger.verbose("accepted calendar invite", req, { calendar_id: req.params.calendar_id });
    res.json({
        Status: 'ok',
        calendar: req.params.calendar_id,
    });
});

//sharing by link
router.patch('/:calendar_id/share_with_link', isAuthenticated, async function (req, res) {
    traceLogger.verbose("checking if requester has been invited...", req, { calendar_id: req.params.calendar_id });
    const calendar = await Calendar_schema_meta.findOne({
        _id: req.params.calendar_id,
        shareLink: true,
    });

    //individual check
    if (calendar === null) {
        res.json({
            Status: 'error',
            error:
                'Calendar does not exist or has link sharing disabled',
        });
        return;
    }

    const usr = await User_schema.findOne({
        _id: req.user.uid,
        'calendars._id': req.params.calendar_id,
      });
    if (usr != null) {
        res.json({
          Status: 'error',
          error:
            'User already has the calendar',
        });
        return;
      }

    traceLogger.verbose("updating calendar...", req, {});
    await Calendar_schema_main.updateOne(
        { _id: req.params.calendar_id },
        {
            $pull: { pendingUsers: { _id: req.user.uid } },
            $addToSet: { users: { _id: req.user.uid, times: [] } },
        }
    );

    traceLogger.verbose("updating user...", req, {});
    await User_schema.updateOne(
        { _id: req.user.uid },
        {
            $pull: { pendingCalendars: { _id: req.params.calendar_id } },
            $addToSet: { calendars: { _id: req.params.calendar_id } },
        }
    );

    traceLogger.verbose("accepted calendar invite via shareLink", req, { calendar_id: req.params.calendar_id });
    res.json({
        Status: 'ok',
        calendar: req.params.calendar_id,
    });
}
);

//decline invite
router.patch('/:calendar_id/decline', isAuthenticated, async function (req, res) {
	traceLogger.verbose("checking if requester has been invited...", req, { calendar_id: req.params.calendar_id });
        const cal = await Calendar_schema_main.findOne({
            _id: req.params.calendar_id,
            'pendingUsers._id': req.user.uid,
        });
        if (cal === null) {
            res.json({
                Status: 'error',
                error:
                    'You have not been invited to this calendar or this calendar does not exist',
            });
            return;
        }

	traceLogger.verbose("updating user...", req, {});
        await User_schema.updateOne(
            { _id: req.user.uid },
            { $pull: { pendingCalendars: { _id: req.params.calendar_id } } }
        );
	traceLogger.verbose("updating calendar...", req, {});
        await Calendar_schema_main.updateOne(
            { _id: req.params.calendar_id },
            { $pull: { pendingUsers: { _id: req.user.uid } } }
        );

	traceLogger.verbose("declined calendar invite", req, { calendar_id: req.params.calendar_id });
        res.json({
            Status: 'ok',
            calendar: cal._id,
        });
    }
);

//leave calendar
router.patch('/:calendar_id/leave', isAuthenticated, async function (req, res) {
    traceLogger.verbose("checking if requester is in calendar...", req, { calendar_id: req.params.calendar_id });
    const cal = await Calendar_schema_main.findOne({
        _id: req.params.calendar_id,
        'users._id': req.user.uid,
    });

    if (cal === null) {
        res.json({
            Status: 'error',
            error:
                'Calendar does not exist or you are not able to leave the calendar',
        });
        return;
    }

    if (cal.owner._id === req.user.uid) {
        res.json({
            Status: 'error',
            error: 'You cannot leave the calendar when you are the owner',
        });
        return;
    }

    traceLogger.verbose("updating user...", req, {});
    await User_schema.updateOne(
        { _id: req.user.uid },
        {
            $pull: { calendars: { _id: req.params.calendar_id } },
        }
    );
    traceLogger.verbose("updating calendar...", req, {});
    await Calendar_schema_main.updateOne(
        { _id: req.params.calendar_id },
        {
            $pull: { users: { _id: req.user.uid } },
        }
    );

    traceLogger.verbose("left calendar", req, { calendar_id: req.params.calendar_id });
    res.json({
        Status: 'ok',
        calendar: req.params.calendar_id,
    });
});

module.exports = router;
