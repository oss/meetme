const { isAuthenticated } = require("./passport/util");
const express = require('express');
const router = express.Router();

router.get('/logout', isAuthenticated, function (req, res, next) {
    req.logout(function (err) {
        if (err) { 
            res.json({
                Status: 'error',
                error: error
            }); 
        }
    });

    res.json({
        Status: 'ok',
    });
});

module.exports = router;
