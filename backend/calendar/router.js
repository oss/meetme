const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../auth/passport/util');
const handler = require('./calendar-handler');

router.use(require('./cal'));
router.use(require('./meeting_time'));
router.use(require('./meetme'));
router.use(require('./name'));
router.use(require('./owner'));
router.use(require('./shareLink'));
router.use(require('./sharing'));
router.use(require('./timeblocks_calendar'));
router.use(require('./user_timeblocks'));
router.use(require('./userlist'));

router.patch('/:calendar_id/location', isAuthenticated, handler.setLocation);
router.get('/:calendar_id/location', isAuthenticated, handler.getLocation);

module.exports = router;
