const { isAuthenticated } = require("./passport/util");

module.exports = function (router, passport) {
  router.get('/logout',isAuthenticated, function (req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });

    res.json({
      Status: 'ok',
    });
  });
};
