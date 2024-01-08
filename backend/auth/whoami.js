const { isAuthenticated } = require("./passport/util");

module.exports = function (router, passport) {
    router.get('/whoami', isAuthenticated, function (req, res, next) {
        console.log("whoami",req.session);

        res.json({
            Status: 'ok',
            user: req.user,
            session: req.session
        });
    });
};
