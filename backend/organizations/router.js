const express = require('express');
const router = express.Router();

router.use(require('./memberlist'));
router.use(require('./orgs'));
router.use(require('./sharing'));

module.exports = router;