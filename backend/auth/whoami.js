const { isAuthenticated } = require("./passport/util");
const express = require('express');
const router = express.Router();

router.get('/whoami', isAuthenticated, function (req, res, next) {
    console.log("whoami", req.session);

    res.json({
        Status: 'ok',
        user: req.user,
        session: req.session
    });
});

module.exports = router;