const express = require('express');
const router = express.Router();
const Org_schema = require('./organization_schema');
const { isAuthenticated } = require('../auth/passport/util');
const { traceLogger, _baseLogger } = require('#logger');

router.get('/:organization_id/memberlist', isAuthenticated, async function (req, res) {
  const org = await Org_schema.findOne(
    {
      _id: req.params.organization_id,
      $or: [
        { owner: req.user.uid },
        { 'admins._id': req.user.uid },
        { 'editors._id': req.user.uid },
        { 'members._id': req.user.uid },
        { viewers_id: req.user.uid },
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
    res.json({
      Status: 'error',
      error: 'org does not exist or you do not have permission to access',
    });
    return;
  }
  traceLogger.verbose("fetched memberlist of org", req, { uid: req.user.uid, org_id: req.params.organization_id });
  res.json({
    Status: 'ok',
    memberlist: org,
  });
});

module.exports = router;
