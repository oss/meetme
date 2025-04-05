const express = require('express');
const router = express.Router();

router.use(require('./google_tokens'));

module.exports = router;