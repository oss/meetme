const express = require('express');
const router = express.Router();
const User_schema = require('./user_schema');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../auth/passport/util');


router.patch('/google_tokens', isAuthenticated, async function (req, res) {

  //updates the userdata schema
  const user_data = await User_schema.findOne({ _id: req.user.uid });
  user_data.googleTokens.access_token = req.body.access_token;
  user_data.googleTokens.refresh_token = req.body.refresh_token;
  user_data.googleTokens.expires = req.body.expires
  await user_data.save();
  res.json({
    Status: 'Ok',
  });
  return;
});

router.get('/google_info', isAuthenticated, async function (req, res) {

  //updates the userdata schema
  const user_data = await User_schema.findOne({ _id: req.user.uid });
  res.json({
    Status: 'Ok',
    access_token :user_data.googleTokens.access_token,
    refresh_token:user_data.googleTokens.refresh_token,
    expires:user_data.googleTokens.expires
  });
  return;
});


router.get('/google_auth_link', isAuthenticated, async function (req, res) {
  const STATE = "asifhalfi"
  const clientid = "35553104132-c9sos4lv16atkakg7t6nuoi9amktickk.apps.googleusercontent.com";
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

  const user_data = await User_schema.findOne({ _id: req.user.uid });
  user_data.googleTokens.state = STATE;

  const link = `https://accounts.google.com/o/oauth2/v2/auth?scope=`+SCOPES+`&access_type=offline&include_granted_scopes=true&response_type=code&prompt=consent&state=`+STATE+`&redirect_uri=https://localhost.edu&client_id=`+clientid

  
  console.log(link)

  res.json({
    Status: 'ok',
    location: link,
  });
  return;
});


module.exports = router;
