const express = require('express');
const router = express.Router();
const { createHash } = require('crypto');
const { isAuthenticated } = require('../auth/passport/util');
const Organization_schema = require('./organization_schema');
const Calendar_schema_main = require('../calendar/calendar_schema_main');
const Calendar_schema_meta = require('../calendar/calendar_schema_meta');
const User_schema = require('../user/user_schema');
const { traceLogger, _baseLogger } = require('#logger');

router.post('/', isAuthenticated, async function (req, res) {
    if (req.body === undefined) {
        res.json({
            Status: 'error',
            error: 'Missing body',
        });
        return;
    }

    traceLogger.verbose("initializing organization...", req, {});
    //assigns values to the organization
    const Organization = new Organization_schema();
    Organization.name = req.body.name || 'unnamed organization';
    Organization.owner = req.user.uid;
    Organization._id = createHash('sha512')
        .update(new Date().getTime().toString() + req.user.uid + Math.random())
        .digest('base64url');
    Organization.created = new Date().getTime();
    Organization.calendars = [];
    Organization.admins = [];
    Organization.editors = [];
    Organization.members = [];
    Organization.pendingMembers = [];
    Organization.viewers = [];

    traceLogger.verbose("creating organization...", req, {});
    mongoose.connection().transaction(async () => {
        await Organization.save();
        await User_schema.updateOne(
            { _id: req.user.uid },
            { $push: { organizations: { _id: Organization._id } } }
        );
    });

    const received_org = await Organization_schema.findOne(Organization);
    traceLogger.verbose("created org", req, { org_id: Organization._id });
    res.json({
        Status: 'ok',
        organization: received_org,
    });
});

//gets an organization based on id
router.get('/:organization_id', isAuthenticated, async function (req, res) {
    const org_id = req.params.organization_id;
    const netid = req.user.uid;
    traceLogger.verbose("finding org and checking if requester has permission...", req, { org: org_id });
    const org = await Organization_schema.findOne({
        _id: org_id,
        $or: [
            { owner: netid },
            { 'editors._id': netid },
            { 'members._id': netid },
            { 'pendingMembers._id': netid },
            { 'viewers._id': netid },
            { 'admins._id': netid },
        ],
    });
    if (org === null) {
        res.json({
            Status: 'error',
            error: 'Org does not exist or you do not have access to this org',
        });
        return;
    }

    traceLogger.verbose("fetched org", req, { uid: req.user.uid, org_id: org_id });
    res.json({
        Status: 'ok',
        organization: org,
    });
});

//deletes an organization
router.delete('/:organization_id', isAuthenticated, async function (req, res) {
    const organization_id = req.params.organization_id;
    traceLogger.verbose("finding org and checking if requester has permission...", req, { org: organization_id });
    mongoose.connection.transaction(async () => {
        const org = await Organization_schema.findOne({
            _id: organization_id,
            owner: req.user.uid,
        });

        if (org === null) {
            res.json({
                Status: 'error',
                error: 'Organization not found or you do not have permission to delete this organization',
            });
            return;
        }

        //delete calendars owned by org
        traceLogger.verbose("deleting calendar data...", req, {});
        await Calendar_schema_meta.deleteMany({ _id: { $in: org.calendar } });
        await Calendar_schema_main.deleteMany({ _id: { $in: org.calendar } });

        traceLogger.verbose("removing org from owner...", req, {});
        await User_schema.updateOne(
            { _id: org.owner },
            { $pull: { organizations: { _id: organization_id } } }
        );

        traceLogger.verbose("removing org from editors...", req, {});
        await User_schema.updateMany(
            { _id: { $in: org.editors } },
            {
                $pull: { organizations: { _id: organization_id } },
                $pull: { calendars: { $in: org.calendars } },
            }
        );

        traceLogger.verbose("removing org from members...", req, {});
        await User_schema.updateMany(
            { _id: { $in: org.members } },
            { $pull: { organizations: { _id: organization_id } } }
        );

        traceLogger.verbose("removing org from viewers...", req, {});
        await User_schema.updateMany(
            { _id: { $in: org.viewers } },
            { $pull: { organizations: { _id: organization_id } } }
        );

        traceLogger.verbose("deleting org...", req, {});
        await Organization_schema.deleteOne(org);

        traceLogger.verbose("deleted org", req, { org_id: organization_id });
        res.json({
            Status: 'ok',
            org: {
                id: org._id,
                name: org.name,
            },
        });
    });
});

//handles leaving an organization
router.delete('/:organization_id/leave', isAuthenticated, async function (req, res) {
    const org_id = req.params.organization_id;
    const uid = req.user.uid;

    // TODO(ivan): this should probably be removed
    if (!uid.toString().match(req.user.uid)) {
        res.json({
            Status: 'error',
            error: 'Incorrect target users payload',
        });
        return;
    }

    mongoose.connection().transaction(async () => {
        traceLogger.verbose("finding org and checking if requester has permission...", req, { org: org_id });
        // TODO(ivan): check permissions and also check if org has to be removed from users as well
        const target_org = await Organization_schema.findOne({
            _id: org_id,
            $or: [{ owner: req.user.uid }, { admins: { _id: req.user.uid } }],
        });

        if (target_org === null) {
            res.json({
                Status: 'error',
                error:
	'The organization does not exist or you do not have access to share',
            });
            return;
        }

        traceLogger.verbose("leaving organization...", req, {});
        await Organization_schema.updateOne(
            { _id: org_id },
            {
                $pull: {
	  editors: { _id: uid },
	  members: { _id: uid },
	  viewers: { _id: uid },
                },
            }
        );

        traceLogger.verbose("left org", req, { org_id: org_id });
        res.json({
            Status: 'ok',
        });
    });
});

module.exports = router;
