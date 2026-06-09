const express = require('express');
const router = express.Router();
const { createHash } = require('crypto');
const { isAuthenticated } = require('../auth/passport/util');
const Organization_schema = require('./organization_schema');
const Calendar_schema_main = require('../calendar/calendar_schema_main');
const Calendar_schema_meta = require('../calendar/calendar_schema_meta');
const User_schema = require('../user/user_schema');
const { traceLogger, _baseLogger } = require('#logger');

module.exports = router;
