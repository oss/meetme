const express = require('express');
const router = express.Router();

router.use(require('./cal'));
router.use(require('./location'));
router.use(require('./meeting_time'));
router.use(require('./meetme'));
router.use(require('./name'));
router.use(require('./owner'));
router.use(require('./shareLink'));
router.use(require('./sharing'));
router.use(require('./timeblocks_calendar'));
router.use(require('./user_timeblocks'));
router.use(require('./userlist'));

module.exports = router;