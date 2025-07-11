const express = require('express');
const router = express.Router();
const User_schema = require('./user_schema');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../auth/passport/util');
const { valid_netid } = require('../auth/util/LDAP_utils');
const { create_user_ldap } = require('./helpers/modify_user');
const { traceLogger, _baseLogger } = require('#logger');

//full access
router.get('/me', isAuthenticated, async function (req, res) {
    const netid = req.user.uid;

    //searches for the user and returns user data
    target_usr = await User_schema.findOne({ _id: netid });
    if (target_usr === null) {
        res.json({
            Status: 'error',
            error: 'Student not found',
        });
        return;
    }
    
    traceLogger.verbose("fetched user info", req, { uid: req.user.uid, });
    res.json({
        Status: 'ok',
        data: target_usr,
    });
});

//limited access
router.get('/:netid', isAuthenticated, async function (req, res) {
    const netid = req.params.netid;
    let target_usr = await User_schema.findOne(
        { _id: netid },
        { _id: 1, alias: 1, name: 1 }
    );

    if (target_usr === null) {
        if (await valid_netid(netid)) {
            
            logger.verbose('creating new user',req, { new_user_netid: netid });

            await create_user_ldap(netid);

            target_usr = await User_schema.findOne(
                { _id: netid },
                { _id: 1, alias: 1, name: 1 }
            );
        } else {
            res.json({
                Status: 'error',
                error: 'User does not exist or has not made an account yet',
            });
            return;
        }
    }

    traceLogger.verbose("fetched user info from netid", req, { uid: req.user.uid, netid: netid });
    res.json({
        Status: 'ok',
        data: target_usr,
    });
});

module.exports = router;
