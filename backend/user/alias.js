const express = require('express');
const router = express.Router();
const User_schema = require('./user_schema');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../auth/passport/util');

//changes alias ie non unique identifiers such as Josh Parson for netid jsp123
router.patch('/alias', isAuthenticated, async function (req, res) {
  const new_alias = req.body.alias;

  //check for banned words
  if (!valid_alias(new_alias)) {
    res.json({
      Status: 'Error',
      Error: 'invalid alias',
    });
    return;
  }

  //updates the userdata schema
  const user_data = await User_schema.findOne({ _id: req.user.attributes.uid });
  const old = user_data.alias;
  user_data.alias = new_alias;
  await user_data.save();
  res.json({
    Status: 'Ok',
    old: old,
    new: new_alias,
  });
});

//need to implement for banned aliases so that it doesnt say true all of the time
function valid_alias(alias) {
  return true;
}

module.exports = router;
