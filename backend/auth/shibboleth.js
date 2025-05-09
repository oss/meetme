const express = require('express');
const router = express.Router();

router.get('/Shibboleth.sso/Metadata', function (req, res, next) {
    res.sendFile(`/etc/meetme/security/shibboleth_metadata.xml`);
});

module.exports = router;
