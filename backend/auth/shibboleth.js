const express = require('express');
const router = express.Router();

router.get('/Shibboleth.sso/Metadata', function (req, res, next) {
    res.sendFile(`${__dirname}/shibboleth/sp-metadata.xml`);
});

module.exports = router;
