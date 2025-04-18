const { isAuthenticated } = require("./passport/util");
const express = require('express');
const router = express.Router();
const logger = require('#logger');

router.get('/logout', isAuthenticated, function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            res.json({
                Status: 'error',
                error: error
            }); 
        }
    });

    logger.log("user logout", req, { uid: req.user.uid });
    res.json({
        Status: 'ok',
    });
});

module.exports = router;
