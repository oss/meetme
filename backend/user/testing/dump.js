const express = require('express');
const { create_user } = require('../helpers/modify_user.js');
const router = express.Router();
const User_schema = require('../user_schema.js');

router.get('/dump_users', async function (req, res) {
  const collection = await User_schema.find({});
  res.json({ dump: collection });
});

router.get('/delete_user/:netid', async function (req, res) {
  const collection = await User_schema.deleteOne({ _id: req.params.netid });
  res.json({ dump: collection });
});

router.get('/create_user/:netid', async function (req, res) {
  const collection = await create_user(req.params.netid);
  res.json({ Status: 'ok' });
});

module.exports = router;
