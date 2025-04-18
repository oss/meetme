const { isAuthenticated } = require("./passport/util");
const express = require('express');
const router = express.Router();
const logger = require('#logger');

router.get('/whoami', isAuthenticated, function (req, res, next) {
    console.log("whoami", req.session);
    logger.info('whoami resolved', req, { netid: req.user.uid });

    res.json({
        Status: 'ok',
        user: req.user,
        session: req.session
    });
});

module.exports = router;