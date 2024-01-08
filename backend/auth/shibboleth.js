module.exports = function (router, passport) {
  router.get('/Shibboleth.sso/Metadata', function (req, res, next) {
    res.sendFile(`${__dirname}/shibboleth/sp-metadata.xml`);
  });
};
