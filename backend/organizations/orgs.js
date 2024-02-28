const express = require('express');
const router = express.Router();
const { createHash } = require('crypto');
const { isAuthenticated } = require('../auth/passport/util');
const Organization_schema = require('./organization_schema');
const Calendar_schema_main = require('../calendar/calendar_schema_main');
const Calendar_schema_meta = require('../calendar/calendar_schema_meta');
const User_schema = require('../user/user_schema');

router.post('/', isAuthenticated, async function (req, res) {
  if (req.body === undefined) {
    res.json({
      Status: 'error',
      error: 'Missing body',
    });
    return;
  }

  try {
    //assigns values to the organization
    const Organization = new Organization_schema();
    Organization.name = req.body.name || 'unnamed organization';
    Organization.owner = req.user.uid;
    Organization._id = createHash('sha512')
      .update(new Date().getTime().toString() + req.user.uid + Math.random())
      .digest('base64url');
    Organization.calendars = [];
    Organization.admins = [];
    Organization.editors = [];
    Organization.members = [];
    Organization.pendingMembers = [];
    Organization.viewers = [];

    await Organization.save();
    const received_org = await Organization_schema.findOne(Organization);
    await User_schema.updateOne(
      { _id: req.user.uid },
      { $push: { organizations: { _id: Organization._id } } }
    );
    res.json({
      Status: 'ok',
      organization: received_org,
    });
  } catch (error) {
    res.json({
      Status: 'error',
      error: JSON.stringify(error),
    });
  }
});

//gets an organization based on id
router.get('/:organization_id', isAuthenticated, async function (req, res) {
  const org_id = req.params.organization_id;
  const netid = req.user.uid;
  try {
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
    res.json({
      Status: 'ok',
      organization: org,
    });
  } catch (error) {
    res.json({
      Status: 'error',
      error: JSON.stringify(error),
    });
  }
});

//deletes an organization
router.delete('/:organization_id', isAuthenticated, async function (req, res) {
  const organization_id = req.params.organization_id;
  try {
    const org = await Organization_schema.findOne({
      _id: organization_id,
      owner: req.user.uid,
    });

    if (org === null) {
      res.json({
        Status: 'error',
        error:
          'Organization not found or you do not have permission to delete this organization',
      });
      return;
    }

    //delete calendars owned by org
    await Calendar_schema_meta.deleteMany({ _id: { $in: org.calendar } });
    await Calendar_schema_main.deleteMany({ _id: { $in: org.calendar } });

    //remove org from owner
    await User_schema.updateOne(
      { _id: org.owner },
      { $pull: { organizations: { _id: organization_id } } }
    );
    //remove org from editors
    await User_schema.updateMany(
      { _id: { $in: org.editors } },
      {
        $pull: { organizations: { _id: organization_id } },
        $pull: { calendars: { $in: org.calendars } },
      }
    );
    //remove org from members
    await User_schema.updateMany(
      { _id: { $in: org.members } },
      { $pull: { organizations: { _id: organization_id } } }
    );
    //remove org from viewers
    await User_schema.updateMany(
      { _id: { $in: org.viewers } },
      { $pull: { organizations: { _id: organization_id } } }
    );

    //delete org from database
    await Organization_schema.deleteOne(org);

    res.json({
      Status: 'ok',
      org: {
        id: org._id,
        name: org.name,
      },
    });
  } catch (error) {
    res.json({
      Status: 'error',
      error: JSON.stringify(error),
    });
  }
});

//handles leaving an organization
router.delete('/:organization_id/leave', isAuthenticated, async function (req, res) {
    const org_id = req.params.organization_id;
    const uid = req.user.uid;

    if (!uid.toString().match(req.user.uid)) {
      res.json({
        Status: 'error',
        error: 'Incorrect target users payload',
      });
      return;
    }

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

    res.json({
      Status: 'ok',
    });
  }
);

module.exports = router;
