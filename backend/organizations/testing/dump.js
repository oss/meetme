const express = require('express');
const router = express.Router();
const Org_schema = require('../organization_schema');

router.get('/dump_orgs', async function (req, res) {
  const collection = await Org_schema.find({});
  res.json({ dump: collection });
});

module.exports = router;
