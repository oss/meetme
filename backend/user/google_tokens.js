const express = require('express');
const router = express.Router();
const User_schema = require('./user_schema');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../auth/passport/util');


async function use_refresh_token(uid){

  const user_data = await User_schema.findOne({ _id: uid });

  let data = await fetch(`https://oauth2.googleapis.com/token`, {
    method: "POST",
    credentials: "omit",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        client_id:"35553104132-c9sos4lv16atkakg7t6nuoi9amktickk.apps.googleusercontent.com",
        client_secret:"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",
        refresh_token:user_data.googleTokens.refresh_token,
        grant_type:"refresh_token"
    }),
  }).then((res) => res.json());

  const timeObject = new Date(Date.now() + data.expires_in * 1000);

  user_data.googleTokens.access_token = data.access_token;
  user_data.googleTokens.expires = timeObject.valueOf();
  await user_data.save();

}

router.patch('/google_tokens', isAuthenticated, async function (req, res) {

  const code = req.body.code;

  if (code === undefined || code === null) {
    res.json({
        Status: 'error',
        error: 'No code provided',
    });
    return;
  }

  const data = await fetch(`https://oauth2.googleapis.com/token`, {
    method: "POST",
    credentials: "omit",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        code:code,
        client_id:"35553104132-c9sos4lv16atkakg7t6nuoi9amktickk.apps.googleusercontent.com",
        client_secret:"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",
        redirect_uri:"https://localhost.edu",
        grant_type:"authorization_code"
    }),
  }).then((res) => res.json());

  console.log(data)

  const timeObject = new Date(Date.now() + data.expires_in * 1000);

  //updates the userdata schema
  const user_data = await User_schema.findOne({ _id: req.user.uid });
  user_data.googleTokens.access_token = data.access_token;
  user_data.googleTokens.refresh_token = data.refresh_token;
  user_data.googleTokens.expires = timeObject.valueOf();
  await user_data.save();
  res.json({
    Status: 'Ok',
  });
  return;
});

router.delete('/google_remove', isAuthenticated, async function (req, res) {

  const timeObject = new Date();

  const user_data = await User_schema.findOne({ _id: req.user.uid });
  user_data.googleTokens.access_token = "";
  user_data.googleTokens.refresh_token = "";
  user_data.googleTokens.expires = timeObject.valueOf();
  await user_data.save();
  res.json({
    Status: 'Ok',
  });
  return;
});

router.get('/google_info', isAuthenticated, async function (req, res) {


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

router.get('/google_cal_dates', isAuthenticated, async function (req, res) {

  const user_data = await User_schema.findOne({ _id: req.user.uid });

  if (user_data.access_token === undefined || user_data.access_toke === null) {
    res.json({
        Status: 'error',
        error: 'Not verified',
    });
    return;
  }

  const minTime = new Date().toISOString()
  const maxTime = new Date(minTime + 48 * 3600)


  if (minTime === undefined || minTime === null || maxTime === undefined || maxTime === null) {
    res.json({
        Status: 'error',
        error: 'No Time Range provided',
    });
    return;
  }

  const data = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${user_data.googleTokens.access_token}&singleEvents=True&orderBy=startTime&timeMin=${minTime}&timeMax=${maxTime}`, {
        method: "GET",
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());

  if (data.error.code == 401){
    use_refresh_token(req.user.uid)
  }

  res.json({
    Status: 'ok',
    data: data,
  });
  return;
});


router.get('/google_verified', isAuthenticated, async function (req, res) {

  const user_data = await User_schema.findOne({ _id: req.user.uid });
  const verified = user_data.googleTokens.refresh_token ? true : false;

  res.json({
    Status: 'ok',
    verified: verified,
  });
  return;
});


module.exports = router;
