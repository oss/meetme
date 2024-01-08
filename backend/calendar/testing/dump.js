const express = require('express');
const router = express.Router();
const Calendar_schema_metadata = require('../calendar_schema_meta');
const Calendar_schema_maindata = require('../calendar_schema_main');

router.get('/dump_metadata', async function (req, res) {
  const collection = await Calendar_schema_metadata.find({});
  res.json({ dump: collection });
});

router.get('/dump_maindata', async function (req, res) {
  const collection = await Calendar_schema_metadata.find({});
  res.json({ dump: collection });
});

module.exports = router;
