const express = require('express');
const router = express.Router();
const User_schema = require('../user_schema');
const mongoose = require('mongoose');
const { getinfo_from_netid } = require('../../auth/util/LDAP_utils');
const { typeCheck, netidCheck } = require("#util/assert");

async function create_user_ldap(netid) {
    const extra_user_info = await getinfo_from_netid(netid);
    if(extra_user_info === null)
        throw new Error('invalid netid');

    const user = new User_schema();

    user._id = netid;
    user.alias = netid;
    user.last_signin = -1;
    user.account_created = new Date().getTime();
  
    user.name.first = extra_user_info.givenName;
    user.name.middle = null;
    user.name.last = extra_user_info.sn;
    user.calendars = [];
    user.organizations = [];
    user.pendingCalendars = [];
    user.pendingOrganizations = [];

    await User_schema.insertOne(user);
}

async function create_user_shib({ uid, firstName, lastName }){
    typeCheck.assert(uid,typeCheck.validPrimitives.string);
    netidCheck.assert(uid);

    typeCheck.assert(firstName,typeCheck.validPrimitives.string);
    typeCheck.assert(lastName,typeCheck.validPrimitives.string);

    const newUser = new User_schema();
    newUser._id = uid;
    newUser.alias = uid;
    newUser.last_signin = -1;
    newUser.account_created = new Date().getTime();
    newUser.name.first = firstName;
    newUser.name.middle = null;
    newUser.name.last = lastName;
    newUser.calendars = [];
    newUser.organizations = [];
    newUser.pendingCalendars = [];
    newUser.pendingOrganizations = [];

    return await User_schema.insertOne(newUser);
}

async function update_last_login(netid) {
    const res = await User_schema.findOneAndUpdate({ _id: netid },{ last_signin: new Date().getTime()});
    if( res === null)
        throw new Error("could not update login time");
}

module.exports = { create_user_shib , create_user_ldap, update_last_login };
