const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../user/user_schema');
const User_schema = require('../user/user_schema');
const Org_schema = require('./organization_schema');
const { valid_netid } = require('../auth/util/LDAP_utils');
const { create_user } = require('../user/helpers/modify_user');
const { isAuthenticated } = require('../auth/passport/util');

router.patch('/:organization_id/share', isAuthenticated, async function (req, res) {
  const org_id = req.params.organization_id;
  let new_users = req.body.new_users;

  if (new_users === undefined) {
    res.json({
      Status: 'error',
      Error: 'missing new_users body',
    });
    return;
  }

  if (!new_users.toString().match('(?:[a-zA-Z0-9]+,?)+')) {
    res.json({
      Status: 'Error',
      Error: 'Incorrect new users payload',
    });
    return;
  }

  if (new_users.length === 0) {
    res.json({
      Status: 'Error',
      Error: 'New users body is empty',
    });
    return;
  }

  const target_org = await Org_schema.findOne({
    _id: org_id,
    $or: [{ owner: req.user.uid }, { admins: { _id: req.user.uid } }],
  });

  if (target_org === null) {
    res.json({
      Status: 'error',
      Error: 'Organization does not exist or you do not have access',
    });
    return;
  }

  const return_payload = {
    added: [],
    not_added: [],
    already_added: [],
  };

  for (let i = 0; i < new_users.length; i++) {
    console.log(target_org);
    const new_user = new_users[i];
    console.log(new_user);
    //invalid users not added
    if ((await valid_netid(new_user)) === false) {
      return_payload.not_added.push(new_user);
      continue;
    }
    //null valid users are created and added
    else if ((await User_schema.findOne({ _id: new_user })) === null) {
      await create_user(new_user);
      return_payload.added.push(new_user);
      await User_schema.updateOne(
        { _id: new_user },
        { $push: { pendingOrganizations: { _id: target_org._id } } }
      );
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
      return_payload.already_added.push(new_user);
    }
    //add valid, created, not dupe accounts to org
    else {
      return_payload.added.push(new_user);
      target_org.pendingMembers.push({ _id: new_user });
      await User_schema.updateOne(
        { _id: new_user },
        { $push: { pendingOrganizations: { _id: target_org._id } } }
      );
    }
    console.log(target_org);
  }

  await target_org.save();

  res.json({
    Status: 'ok',
    user_list: return_payload,
  });
});

router.patch('/:organization_id/decline', isAuthenticated, async function (req, res) {
  const org_id = req.params.organization_id;

  const target_org = await Org_schema.findOne({
    _id: org_id,
    'pendingMembers._id': req.user.uid,
  });

  if (target_org === null) {
    res.json({
      Status: 'error',
      Error: 'you do not have access to this org or this org does not exist',
    });
    return;
  }

  await Org_schema.updateOne(
    { _id: org_id },
    {
      $pull: {
        pendingMembers: { _id: req.user.uid },
      },
    }
  );

  await User_schema.updateOne(
    { _id: req.user.uid },
    { $pull: { pendingOrganizations: { _id: org_id } } }
  );

  res.json({
    Status: 'ok',
    org: req.params.org_id,
  });
});

router.patch('/:organization_id/accept', isAuthenticated, async function (req, res) {
  const org_id = req.params.org_id;

  const target_org = await Org_schema.findOne({
    _id: org_id,
    'pendingMembers._id': req.user.uid,
  });

  if (target_org === null) {
    res.json({
      Status: 'error',
      Error: 'Organization does not exist or you do not have access',
    });
    return;
  }

  await Org_schema.updateOne(
    { _id: req.params.org_id },
    {
      $pull: { pendingMembers: { _id: req.user.uid } },
      $push: { members: { _id: req.user.uid } },
    }
  );

  await User_schema.updateOne(
    { _id: req.user.uid },
    {
      $pull: { pendingOrganizations: { _id: req.params.org_id } },
      $push: { organizations: { _id: req.params.org_id } },
    }
  );

  res.json({
    Status: 'ok',
    org: req.params.org_id,
  });
});

module.exports = router;
