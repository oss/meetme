const express = require('express');
const router = express.Router();

router.use(require('./memberlist'));
router.use(require('./orgs'));
router.use(require('./sharing'));

const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../auth/passport/util');
const handler = require('./organization-handler');

// TODO: this implementation looks sketchy (does same thing as getOrganization), take a look later 
router.get('/:organization_id/memberlist', isAuthenticated, handler.getMemberlist);

// Organization endpoints
router.post('/', isAuthenticated, handler.createOrganization);
router.get('/:organization_id', isAuthenticated, handler.getOrganization);
router.delete('/:organization_id', isAuthenticated, handler.deleteOrganization);
router.delete('/:organization_id/leave', isAuthenticated, handler.leaveOrganization);

// Organization invites
router.patch('/:organization_id/share', isAuthenticated, handler.shareOrganization);
router.patch('/:organization_id/decline', isAuthenticated, handler.declineOrganizationInvite);
router.patch('/:organization_id/accept', isAuthenticated, handler.acceptOrganizationInvite);

module.exports = router;
module.exports = router;
