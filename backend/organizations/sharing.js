const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../user/user_schema');
const User_schema = require('../user/user_schema');
const Org_schema = require('./organization_schema');
const { valid_netid } = require('../auth/util/LDAP_utils');
const { create_user_netid } = require('../user/helpers/modify_user');
const { isAuthenticated } = require('../auth/passport/util');
const { traceLogger, _baseLogger } = require('#logger');

router.patch('/:organization_id/share', isAuthenticated, async function (req, res) {
    const org_id = req.params.organization_id;
    let new_users = req.body.new_users;

    traceLogger.verbose("validating parameters...", req, { new_users: new_users });
    if (new_users === undefined) {
        res.json({
            Status: 'error',
            error: 'missing new_users body',
        });
        return;
    }

    if (!new_users.toString().match('(?:[a-zA-Z0-9]+,?)+')) {
        res.json({
            Status: 'error',
            error: 'Incorrect new users payload',
        });
        return;
    }

    if (new_users.length === 0) {
        res.json({
            Status: 'error',
            error: 'New users body is empty',
        });
        return;
    }

    traceLogger.verbose("finding org and checking if requester has permission...", req, { org: org_id });
    const target_org = await Org_schema.findOne({
        _id: org_id,
        $or: [{ owner: req.user.uid }, { admins: { _id: req.user.uid } }],
    });

    if (target_org === null) {
        res.json({
            Status: 'error',
            error: 'Organization does not exist or you do not have access',
        });
        return;
    }

    const return_payload = {
        added: [],
        not_added: [],
        already_added: [],
    };

    traceLogger.verbose("creating payload...", req, {});
    for (let i = 0; i < new_users.length; i++) {
        console.log(target_org);
        const new_user = new_users[i];
        console.log(new_user);
        //invalid users not added
        if ((await valid_netid(new_user)) === false) {
            traceLogger.verbose("skipping invalid user...", req, { user: new_user });
            return_payload.not_added.push(new_user);
            continue;
        }
        //null valid users are created and added
        else if ((await User_schema.findOne({ _id: new_user })) === null) {
            traceLogger.verbose("missing user, creating user...", req, { user: new_user });
            await create_user_netid(new_user);
            traceLogger.verbose("created user, adding to payload...", req, { });
            return_payload.added.push(new_user);
            traceLogger.verbose("updating user data...", req, { });
            await User_schema.updateOne(
                { _id: new_user },
                { $push: { pendingOrganizations: { _id: target_org._id } } }
            );
            traceLogger.verbose("user added to payload", req, { });
            target_org.pendingMembers.push({ _id: new_user });
            continue;
        }
        //duplicates not added to org
        else if (
            new_user === target_org.owner ||
      target_org.editors.some((item) => {
          return item._id === new_user;
      }) ||
      target_org.viewers.some((item) => {
          return item._id === new_user;
      }) ||
      target_org.members.some((item) => {
          return item._id === new_user;
      }) ||
      target_org.pendingMembers.some((item) => {
          return item._id === new_user;
      })
        ) {
            traceLogger.verbose("skipping duplicate user...", req, { user: new_user });
            return_payload.already_added.push(new_user);
        }
        //add valid, created, not dupe accounts to org
        else {
            return_payload.added.push(new_user);
            target_org.pendingMembers.push({ _id: new_user });
            traceLogger.verbose("valid user, updating user data...", req, { user: new_user });
            await User_schema.updateOne(
                { _id: new_user },
                { $push: { pendingOrganizations: { _id: target_org._id } } }
            );
            traceLogger.verbose("added user to org", req, {  });
        }
        console.log(target_org);
    }

    traceLogger.verbose("updating org data...", req, {});
    await target_org.save();

    traceLogger.verbose("shared org with users", req, { uid: req.user.uid, org_id: org_id, user_list: return_payload });
    res.json({
        Status: 'ok',
        user_list: return_payload,
    });
});

router.patch('/:organization_id/decline', isAuthenticated, async function (req, res) {
    const org_id = req.params.organization_id;

    traceLogger.verbose("checking if requester is invited to org", req, { org: org_id });
    const target_org = await Org_schema.findOne({
        _id: org_id,
        'pendingMembers._id': req.user.uid,
    });

    if (target_org === null) {
        res.json({
            Status: 'error',
            error: 'you do not have access to this org or this org does not exist',
        });
        return;
    }


    traceLogger.verbose("removing user from pending members...", req, { });
    await Org_schema.updateOne(
        { _id: org_id },
        {
            $pull: {
                pendingMembers: { _id: req.user.uid },
            },
        }
    );

    traceLogger.verbose("removing org from pending orgs...", req, { });
    await User_schema.updateOne(
        { _id: req.user.uid },
        { $pull: { pendingOrganizations: { _id: org_id } } }
    );

    traceLogger.verbose("declined org invite", req, { org_id: org_id });
    res.json({
        Status: 'ok',
        org: org_id,
    });
});

router.patch('/:organization_id/accept', isAuthenticated, async function (req, res) {
    const org_id = req.params.organization_id;

    traceLogger.verbose("checking if requester is invited to org...", req, { org: org_id });
    const target_org = await Org_schema.findOne({
        _id: org_id,
        'pendingMembers._id': req.user.uid,
    });

    if (target_org === null) {
        res.json({
            Status: 'error',
            error: 'Organization does not exist or you do not have access',
        });
        return;
    }

    traceLogger.verbose("adding requester to org...", req, { });
    await Org_schema.updateOne(
        { _id: req.params.organization_id },
        {
            $pull: { pendingMembers: { _id: req.user.uid } },
            $push: { members: { _id: req.user.uid } },
        }
    );

    traceLogger.verbose("updating user data...", req, { });
    await User_schema.updateOne(
        { _id: req.user.uid },
        {
            $pull: { pendingOrganizations: { _id: org_id } },
            $push: { organizations: { _id: org_id } },
        }
    );

    traceLogger.verbose("accepted org invite", req, { org_id: org_id });
    res.json({
        Status: 'ok',
        org: req.params.organization_id,
    });
});

module.exports = router;
