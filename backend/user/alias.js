const express = require('express');
const router = express.Router();
const User_schema = require('./user_schema');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../auth/passport/util');
const { traceLogger, _baseLogger } = require('#logger');

//changes alias ie non unique identifiers such as Josh Parson for netid jsp123
router.patch('/alias', isAuthenticated, async function (req, res) {
    const new_alias = req.body.alias;

    //check for banned words
    traceLogger.verbose("validating alias...", req, { alias: new_alias });
    if (!valid_alias(new_alias)) {
        res.json({
            Status: 'error',
            error: 'invalid alias',
        });
        return;
    }

    //updates the userdata schema
    traceLogger.verbose("updating user schema...", req, { });
    const user = await User_schema.findByIdAndUpdate(req.user.uid, { alias: new_alias });
    traceLogger.verbose("created alias", req, { old: user.alias, new: new_alias });

    res.json({
        Status: 'Ok',
        old: user.alias,
        new: new_alias,
    });
});

//need to implement for banned aliases so that it doesnt say true all of the time
function valid_alias(alias) {
    return true;
}

module.exports = router;
