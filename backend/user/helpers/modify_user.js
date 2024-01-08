const express = require('express');
const router = express.Router();
const User_schema = require('../user_schema');
const mongoose = require('mongoose');
const { getinfo_from_netid } = require('../../auth/util/LDAP_utils');

async function create_user(netid) {
  const user = new User_schema();
  user._id = netid;
  user.alias = netid;

  user.last_signin = -1;
  user.account_created = new Date().getTime();
  const extra_user_info = await getinfo_from_netid(netid);
  console.log(extra_user_info);
  user.name.first = extra_user_info.firstName;
  user.name.middle = null;
  user.name.last = extra_user_info.lastName;
  user.calendars = [];

  try {
    //save to variable to force to wait
    await user.save();
    const check = await User_schema.findOne(user);
    console.log('--- created new user ---');
    console.log(check);
    console.log('------------------------');
    return {
      Status: 'ok',
      Result: 'Student added',
      data: check,
    };
    //adds user
  } catch (e) {
    return {
      Status: 'Error',
      Error: 'Could not add user to database',
    };
  }
}

async function update_last_login(netid) {
  const user = await User_schema.findOne({ _id: netid });
  console.log(JSON.stringify(user));
  user.last_signin = new Date().getTime();
  await user.save();
}

module.exports = { create_user, update_last_login };
