const express = require('express');
const router = express.Router();

router.use(require('./login'));
router.use(require('./logout'));
router.use(require('./shibboleth'));
router.use(require('./whoami'));

module.exports = router;