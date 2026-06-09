const mongoose = require('mongoose');
const User_schema = require('./user_schema');
const { valid_netid } = require('../auth/util/LDAP_utils');
const { create_user_ldap } = require('./helpers/modify_user');
const { traceLogger, _baseLogger } = require('#logger');

export async function setAlias(req, userid, alias) {
    //updates the userdata schema
    traceLogger.verbose("updating user schema...", req, { });
    const user = await User_schema.findByIdAndUpdate(req.user.uid, { alias: new_alias });
    const old_alias = user.alias;
    traceLogger.verbose("created alias", req, { old: old_alias, new: new_alias });
    return old_alias;
}

export async function getUser(req, userid, isSelf) {
    if (isSelf) {
	user = await User_schema.findOne({ _id: netid });
	if (user === null) {
	    throw new Error("User not found");
	}
	traceLogger.verbose("fetched user info", req, { uid: userid });
	return user;
    }

    let user = await User_schema.findOne(
        { _id: netid },
        { _id: 1, alias: 1, name: 1 }
    );

    if (user === null) {
	if (!(await valid_netid(userid))) {
	    throw new Error('User does not exist or has not made an account yet');
	}

	// TODO: I don't think we should do this in prod
	traceLogger.verbose('creating new user', req, { new_user_netid: userid });
	await create_user_ldap(userid);
	user = await User_schema.findOne(
	    { _id: netid },
	    { _id: 1, alias: 1, name: 1 }
	);
    }

    traceLogger.verbose("fetched user info", req, { uid: userid });
    return user;
}
