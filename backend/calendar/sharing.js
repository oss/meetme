const express = require('express');
const router = express.Router();
const Calendar_schema_main = require('./calendar_schema_main');
const Calendar_schema_meta = require('./calendar_schema_meta');
const User_schema = require('../user/user_schema');
const mongoose = require('mongoose');
const Org_schema = require('../organizations/organization_schema');
const { isAuthenticated } = require('../auth/passport/util');
const { valid_netid } = require('../auth/util/LDAP_utils');
const { create_user } = require('../user/helpers/modify_user');
const { traceLogger, _baseLogger } = require('#logger');

//invite users
router.patch('/:calendar_id/share', isAuthenticated, async function (req, res) {
    const new_users = req.body.new_users;
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

    for (let i = 0; i < new_users.length; i++) {
        const new_user = new_users[i];
        if (!(await valid_netid(new_users[i]))) {
            payload.not_added.push(new_user);
            continue;
        }

        const usr = await User_schema.findOne({ _id: new_user });
        if (usr === null) {
            await create_user(new_user);
            payload.added.push(new_user);
            calendar.pendingUsers.push({ _id: new_user });
            continue;
        }
        if (
            usr.calendars.some((item) => {
                return item._id === req.params.calendar_id;
            })
        )
            payload.already_added.push(new_user);
        else if (
            usr.pendingCalendars.some((item) => {
                return item._id === req.params.calendar_id;
            })
        )
            payload.already_added.push(new_user);
        else {
            payload.added.push(new_user);
            calendar.pendingUsers.push({ _id: new_user });
        }
    }

    await calendar.save();
    await User_schema.updateMany(
        { _id: { $in: payload.added } },
        { $push: { pendingCalendars: { _id: req.params.calendar_id } } }
    );

    traceLogger.verbose("added users to calendar", req, { uid: req.user.uid, owner: cal.owner, calendar_id: calendar_id, payload: payload });
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

    //org check mode
    if (org_info !== null)
        for (let i = 0; i < target_users.length; i++) {
            const new_user = target_users[i];
            if (
                new_user === org_info.owner._id ||
                org_info.admins.some((item) => {
                    return item._id === new_user;
                })
            ) {
                payload.not_removed.push(new_user);
                continue;
            } else payload.removed.push(new_user);
        }
    else
        for (let i = 0; i < target_users.length; i++) {
            const new_user = target_users[i];
            if (new_user === calendar.owner._id) payload.not_removed.push(new_user);
            else payload.removed.push(new_user);
        }
    await Calendar_schema_main.updateOne(
        { _id: req.params.calendar_id },
        { $pull: { users: { _id: { $in: payload.removed } } } }
    );
    await User_schema.updateMany(
        { _id: { $in: payload.removed } },
        { $pull: { calendars: { _id: req.params.calendar_id } } }
    );

    traceLogger.verbose("removed users from calendar", req, { uid: req.user.uid, owner: cal.owner, calendar_id: calendar_id, payload: payload });
    res.json({
        Status: 'ok',
        user_list: payload,
    });
}
);

//accept invite
router.patch('/:calendar_id/accept', isAuthenticated, async function (req, res) {
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

    await Calendar_schema_main.updateOne(
        { _id: req.params.calendar_id },
        {
            $pull: { pendingUsers: { _id: req.user.uid } },
            $push: { users: { _id: req.user.uid, times: [] } },
        }
    );

    await User_schema.updateOne(
        { _id: req.user.uid },
        {
            $pull: { pendingCalendars: { _id: req.params.calendar_id } },
            $push: { calendars: { _id: req.params.calendar_id } },
        }
    );

    traceLogger.verbose("accepted calendar invite", req, { uid: req.user.uid, calendar_id: req.params.calendar_id });
    res.json({
        Status: 'ok',
        calendar: req.params.calendar_id,
    });
}
);

//sharing by link
router.patch('/:calendar_id/share_with_link', isAuthenticated, async function (req, res) {
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

    await Calendar_schema_main.updateOne(
        { _id: req.params.calendar_id },
        {
            $pull: { pendingUsers: { _id: req.user.uid } },
            $addToSet: { users: { _id: req.user.uid, times: [] } },
        }
    );

    await User_schema.updateOne(
        { _id: req.user.uid },
        {
            $pull: { pendingCalendars: { _id: req.params.calendar_id } },
            $addToSet: { calendars: { _id: req.params.calendar_id } },
        }
    );

    traceLogger.verbose("accepted calendar invite via shareLink", req, { uid: req.user.uid, calendar_id: req.params.calendar_id });
    res.json({
        Status: 'ok',
        calendar: req.params.calendar_id,
    });
}
);

//decline invite
router.patch('/:calendar_id/decline', isAuthenticated, async function (req, res) {
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
        await User_schema.updateOne(
            { _id: req.user.uid },
            { $pull: { pendingCalendars: { _id: req.params.calendar_id } } }
        );
        await Calendar_schema_main.updateOne(
            { _id: req.params.calendar_id },
            { $pull: { pendingUsers: { _id: req.user.uid } } }
        );
	traceLogger.verbose("declined calendar invite", req, { uid: req.user.uid, calendar_id: req.params.calendar_id });
        res.json({
            Status: 'ok',
            calendar: cal._id,
        });
    }
);

//leave calendar
router.patch('/:calendar_id/leave', isAuthenticated, async function (req, res) {
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

    await User_schema.updateOne(
        { _id: req.user.uid },
        {
            $pull: { calendars: { _id: req.params.calendar_id } },
        }
    );
    await Calendar_schema_main.updateOne(
        { _id: req.params.calendar_id },
        {
            $pull: { users: { _id: req.user.uid } },
        }
    );
    traceLogger.verbose("left calendar", req, { uid: req.user.uid, calendar_id: req.params.calendar_id });
    res.json({
        Status: 'ok',
        calendar: req.params.calendar_id,
    });
});

module.exports = router;
