const mongoose = require('mongoose');
const { createHash } = require('crypto');

const Org_schema = require('./organization_schema');
const Calendar_schema_main = require('../calendar/calendar_schema_main');
const Calendar_schema_meta = require('../calendar/calendar_schema_meta');
const User_schema = require('../user/user_schema');

const { create_user } = require('../user/helpers/modify_user');
const { valid_netid } = require('../auth/util/LDAP_utils');
const { traceLogger, _baseLogger } = require('#logger');

async function getWritableOrg(id, userid, req) {
    traceLogger.verbose("finding org and checking if requester has write permission...", req, { org: id });
    const org = await Org_schema.findOne({
	_id: id,
	$or: [{ owner: userid }, { admins: { _id: userid } }],
    });

    if (org === null) {
	throw new Error("Permission denied or organization does not exist");
    }
    return org;
}

export async function getOrg(id, userid, req) {
    traceLogger.verbose("finding org and checking if requester has read permission...", req, { org: id });
    const org = await Org_schema.findOne(
        {
            _id: id,
            $or: [
                { owner: userid },
                { 'admins._id': userid },
                { 'editors._id': userid },
                { 'members._id': userid },
                { 'viewers._id': userid },
		{ 'pendingMembers._id': userid },
            ],
        },
        {
            _id: 1,
            admins: 1,
            editors: 1,
            members: 1,
            viewers: 1,
            owner: 1,
        }
    );
    if (org === null) {
	throw new Error("Permission denied or organization does not exist");
    }
    return org;
}

export async function createOrganization(name, userid, req) {
    traceLogger.verbose("initializing organization...", req, {});
    //assigns values to the organization
    const Organization = new Organization_schema();
    Organization.name = name || 'unnamed organization';
    Organization.owner = userid;
    Organization._id = createHash('sha512')
        .update(new Date().getTime().toString() + userid + Math.random())
        .digest('base64url');
    Organization.created = new Date().getTime();
    Organization.calendars = [];
    Organization.admins = [];
    Organization.editors = [];
    Organization.members = [];
    Organization.pendingMembers = [];
    Organization.viewers = [];

    traceLogger.verbose("creating organization...", req, {});
    mongoose.connection.transaction(async () => {
        await Organization.save();
        await User_schema.updateOne(
            { _id: userid },
            { $push: { organizations: { _id: Organization._id } } }
        );
    });

    const received_org = await Organization_schema.findOne(Organization);

    if (received_org === null) {
	throw new Error('Unable to create the organization');
    }
    return org;
}

export async function deleteOrganization(id, userid, req) {
    traceLogger.verbose("finding org and checking if requester has permission...", req, { org: id });
    mongoose.connection.transaction(async () => {
        const org = await getWritableOrg(id, userid, req);

        //delete calendars owned by org
        traceLogger.verbose("deleting calendar data...", req, {});
        await Calendar_schema_meta.deleteMany({ _id: { $in: org.calendar } });
        await Calendar_schema_main.deleteMany({ _id: { $in: org.calendar } });

        traceLogger.verbose("removing org from owner...", req, {});
        await User_schema.updateOne(
            { _id: org.owner },
            { $pull: { organizations: { _id: id } } }
        );

        traceLogger.verbose("removing org from editors...", req, {});
        await User_schema.updateMany(
            { _id: { $in: org.editors } },
            {
                $pull: { organizations: { _id: id } },
                $pull: { calendars: { $in: org.calendars } },
            }
        );

        traceLogger.verbose("removing org from members...", req, {});
        await User_schema.updateMany(
            { _id: { $in: org.members } },
            { $pull: { organizations: { _id: id } } }
        );

        traceLogger.verbose("removing org from viewers...", req, {});
        await User_schema.updateMany(
            { _id: { $in: org.viewers } },
            { $pull: { organizations: { _id: id } } }
        );

        traceLogger.verbose("deleting org...", req, {});
        await Organization_schema.deleteOne(org);
	return { id: org._id, name: org_name };
    });
}

export async function leaveOrganization(id, userid, req) {
    mongoose.connection.transaction(async () => {
        // TODO(ivan): check permissions and also check if org has to be removed from users as well
	const org = await getWritableOrg(id, userid, req);
        traceLogger.verbose("leaving organization...", req, {});
        await Organization_schema.updateOne(
            { _id: id },
            {
                $pull: {
		    editors: { _id: userid },
		    members: { _id: userid },
		    viewers: { _id: userid },
                },
            }
        );
    });
}

export async function shareOrganization(id, users, userid, req) {
    const org = await getWritableOrg(id, userid, req);
    const payload = {
	added: [],
	new_users: [],
	not_added: [],
	already_added: [],
    };

    traceLogger.verbose("creating payload...", req, {});
    for (const user of users) {
	if ((await valid_netid(user)) === false) {
	    // Invalid users not added
	    traceLogger.verbose("skipping invalid user...", req, { user: user });
	    payload.not_added.push(new_user);
	    continue;
	} else if ((await User_schema.findOne({ _id: user })) === null) {
	    // Null valid users are created and added
	    traceLogger.verbose("missing user, user will be created...", req, { user: user });
	    payload.new_users.push(user);
	    continue;
	} else if (org.hasMember(id)) {
	    // Skip duplicates
	    traceLogger.verbose("skipping duplicate user...", req, { user: user });
	    payload.already_added.push(new_user);
	} else {
	    // Add valid users
	    traceLogger.verbose("valid user, updating user data...", req, { user: user });
	    payload.added.push(new_user);
	    org.pendingMembers.push({ _id: user });
	}
    }

    mongoose.connection.transaction(async () => {
	for (const user of payload.new_users) {
	    traceLogger.verbose("creating user for organization sharing...", req, { user: user });
	    await create_user(new_user);
	    org.pendingMembers.push({ _id: user });
	    payload.added.push(user);
	}

        traceLogger.verbose("updating org data...", req, {});
        await org.save();

	await User_schema.updateMany(
	    { _id: { $in: payload.added } },
	    { $push: { pendingOrganizations: { _id: org.id } } }
	);

    });
    return payload;
}

export async function declineOrganizationInvite(id, userid, req) {
    traceLogger.verbose("checking if requester is invited to org", req, { org: id });
    const org = await Org_schema.findOne({_id: id, 'pendingMembers._id': userid });
    if (target_org === null) {
	throw new Error("Not invited to organization or organization does not exist");
    }

    traceLogger.verbose("declining invite to org...", req, { org: id });
    mongoose.connection.transaction(async () => {
        await Org_schema.updateOne(
            { _id: org.id },
            { $pull: { pendingMembers: { _id: userid } } }
        );
        await User_schema.updateOne(
            { _id: userid },
            { $pull: { pendingOrganizations: { _id: id } } }
        );
    });

    return org.id;
}

export async function acceptOrganizationInvite(id, userid, req) {
    traceLogger.verbose("checking if requester is invited to org", req, { org: id });
    const org = await Org_schema.findOne({_id: id, 'pendingMembers._id': userid });
    if (target_org === null) {
	throw new Error("Not invited to organization or organization does not exist");
    }

    traceLogger.verbose("accepting organization invite", req, { org: id });
    mongoose.connection.transaction(async () => {
	await Org_schema.updateOne(
            { _id: id },
            {
                $pull: { pendingMembers: { _id: userid } },
                $push: { members: { _id: userid } },
            }
        );
        await User_schema.updateOne(
            { _id: userid },
            {
                $pull: { pendingOrganizations: { _id: id } },
                $push: { organizations: { _id: id } },
            }
        );
    });

    return org.id;
}
