const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../auth/passport/util');
const handler = require('./user-handler');

router.patch('/alias', isAuthenticated, handler.setAlias);
router.get('/me', isAuthenticated, handler.getMe);
router.get('/:netid', isAuthenticated, handler.getUser);

module.exports = router;
