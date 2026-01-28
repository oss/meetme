const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../auth/passport/util');
const handler = require('./calendar-handler');

router.use(require('./cal'));
router.use(require('./meetme'));
router.use(require('./owner'));
router.use(require('./sharing'));
router.use(require('./timeblocks_calendar'));
router.use(require('./user_timeblocks'));
router.use(require('./userlist'));

router.patch('/:calendar_id/location', isAuthenticated, handler.setLocation);
router.get('/:calendar_id/location', isAuthenticated, handler.getLocation);

router.patch('/:calendar_id/meet_time', isAuthenticated, handler.setMeetingTime);
router.get('/:calendar_id/meet_time',isAuthenticated, handler.getMeetingTime);

router.patch('/:calendar_id/name', isAuthenticated, handler.setName);
router.get('/:calendar_id/name', isAuthenticated, handler.getName);

router.patch('/:calendar_id/shareLink', isAuthenticated, handler.setShareLink);
router.get('/:calendar_id/shareLink', isAuthenticated, handler.getShareLink);

module.exports = router;
