const { isAuthenticated } = require("./passport/util");
const express = require('express');
const router = express.Router();
const { traceLogger, _baseLogger } = require('#logger');

router.get('/whoami', isAuthenticated, function (req, res, next) {
    console.log("whoami", req.session);
    traceLogger.verbose('whoami resolved', req, { netid: req.user.uid });

    res.json({
        Status: 'ok',
        user: req.user,
        time: req.session.time
    });
});

module.exports = router;
