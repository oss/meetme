const { isAuthenticated } = require("./passport/util");

module.exports = function (router, passport) {
  router.get('/logout',isAuthenticated, function (req, res, next) {
    req.logout();

    res.json({
      Status: 'ok',
    });
  });
};
