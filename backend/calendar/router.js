const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../auth/passport/util');
const handler = require('./calendar-handler');

router.use(require('./cal'));

// TODO: delete calendar for org schema
// TODO: implement /dump

router.post('/', isAuthenticated, handler.createCalendar);
router.delete('/:calendar_id', isAuthenticated, handler.deleteCalendar);
router.get('/:calendar_id/meta', isAuthenticated, handler.getMeta);
router.get('/:calendar_id/main', isAuthenticated, handler.getMain);
router.get('/:calendar_id/links', isAuthenticated, handler.getLinks);

// General calendar settings
router.patch('/:calendar_id/owner', isAuthenticated, handler.setOwner);
router.patch('/:calendar_id/location', isAuthenticated, handler.setLocation);
router.get('/:calendar_id/location', isAuthenticated, handler.getLocation);
router.patch('/:calendar_id/meet_time', isAuthenticated, handler.setMeetingTime);
router.get('/:calendar_id/meet_time',isAuthenticated, handler.getMeetingTime);
router.patch('/:calendar_id/name', isAuthenticated, handler.setName);
router.get('/:calendar_id/name', isAuthenticated, handler.getName);
router.patch('/:calendar_id/shareLink', isAuthenticated, handler.setShareLink);
router.get('/:calendar_id/shareLink', isAuthenticated, handler.getShareLink);

// Gets a list of users in a calendar and is used to calculate color for time selections
router.get('/:calendar_id/memberlist', isAuthenticated, handler.getUserList);

// Timeblocks
router.patch('/:calendar_id/timeblocks', isAuthenticated, handler.setTimeblocks);
router.get('/:calendar_id/timeblocks', isAuthenticated, handler.getTimeblocks);
router.patch('/:calendar_id/me', isAuthenticated, handler.setUserTimeblocks);

// Timelines
router.post('/:calendar_id/meetme', isAuthenticated, handler.getUsers);
router.post('/:calendar_id/meetme/me', isAuthenticated, handler.getMe);

router.patch('/:calendar_id/share', isAuthenticated, handler.shareCalendar);
router.delete('/:calendar_id/share', isAuthenticated, handler.unshareCalendar);

router.patch('/:calendar_id/accept', isAuthenticated, handler.acceptInvite);
router.patch('/:calendar_id/share_with_link', isAuthenticated, handler.acceptSharelinkInvite);

router.patch('/:calendar_id/decline', isAuthenticated, handler.declineInvite);
router.patch('/:calendar_id/leave', isAuthenticated, async function (req, res), handler.leaveCalendar);

module.exports = router;
