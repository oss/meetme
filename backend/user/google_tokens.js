const express = require('express');
const router = express.Router();
const User_schema = require('./user_schema');
const Google_schema = require('./google_state_schema');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../auth/passport/util');
const crypto =  require("crypto");


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

  console.log(data)

  const timeObject = new Date(Date.now() + data.expires_in * 1000);

  user_data.googleTokens.access_token = data.access_token;
  user_data.googleTokens.expires = timeObject.valueOf();
  await user_data.save();

}

async function newState(uid){
  const exists = await Google_schema.findOne({ _id: uid });
  if (exists === null){
    const google_state = new Google_schema();
    google_state._id = uid;
    google_state.state = crypto.randomUUID();
    try {
      //save to variable to force to wait
      await google_state.save();
      const check = await Google_schema.findOne(google_state);
      console.log('--- created new state ---');
      console.log(check);
      console.log('------------------------');
      return {
        Status: 'ok',
        Result: 'State added',
        state: google_state.state,
      };
      //adds user
    } catch (e) {
      console.log("--error--")
      console.log(e)
      return {
        Status: 'error',
        error: 'Could not add state to database',
      };
    }
  }
  else{
    exists.state = crypto.randomUUID();
    await exists.save();
    console.log('--- updated state ---');
    return {
      Status: 'ok',
      Result: 'State updated',
      state: exists.state,
    };
  }
}

async function useCode(code, uid){
  if (code === undefined || code === null) {
    return 'error';
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
        redirect_uri:"https://api.localhost.edu/user/code",
        grant_type:"authorization_code"
    }),
  }).then((res) => res.json());

  console.log(data)

  if (data?.error == "invalid_grant"){
    return 'error'
  }

  const timeObject = new Date(Date.now() + data.expires_in * 1000);

  //updates the userdata schema
  const user_data = await User_schema.findOne({ _id: uid });
  user_data.googleTokens.access_token = data.access_token;
  user_data.googleTokens.refresh_token = data.refresh_token;
  user_data.googleTokens.expires = timeObject.valueOf();
  await user_data.save();
  return 'ok';
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
  const clientid = "35553104132-c9sos4lv16atkakg7t6nuoi9amktickk.apps.googleusercontent.com";
  const SCOPES = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email";

  const State_obj =  await newState(req.user.uid);

  if  (State_obj.Status == 'error'){
    res.json({
      Status: 'error',
      error: 'Something went wrong',
    });
    return;
  }



  const user_data = await User_schema.findOne({ _id: req.user.uid });
  user_data.googleTokens.state = State_obj.state;

  const link = `https://accounts.google.com/o/oauth2/v2/auth?scope=`+SCOPES+`&access_type=offline&include_granted_scopes=true&response_type=code&prompt=consent&state=`+State_obj.state+`&redirect_uri=https://api.localhost.edu/user/code&client_id=`+clientid

  
  console.log(link)

  res.json({
    Status: 'ok',
    link: link,
  });
  return;
});

router.post('/google_email', isAuthenticated, async function (req, res) {
  const user_data = await User_schema.findOne({ _id: req.user.uid });

  console.log(user_data)

  if (user_data.googleTokens.access_token === '' || user_data.googleTokens.access_token === null) {
    res.json({
        Status: 'error',
        error: 'Not verified',
    });
    return;
  }

  const data = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user_data.googleTokens.access_token}`, {
    method: "GET",
    credentials: "omit",
    headers: {
        "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  console.log(data)


  res.json({
  Status: 'ok',
  email: data.email,
  });
  return;

});

router.post('/google_cal_dates', isAuthenticated, async function (req, res) {

  const user_data = await User_schema.findOne({ _id: req.user.uid });

  console.log("dates")
  console.log(user_data)

  if (user_data.googleTokens.access_token === '' || user_data.googleTokens.access_token === null) {
    res.json({
        Status: 'error',
        error: 'Not verified',
    });
    return;
  }

  const minTime = req.body.minTime;
  const maxTime = req.body.maxTime;


  if (minTime === undefined || minTime === null || maxTime === undefined || maxTime === null) {
    res.json({
        Status: 'error',
        error: 'No Time Range provided',
    });
    return;
  }

  if (user_data.googleTokens.refresh_token === undefined || user_data.googleTokens.refresh_token === null) {
    res.json({
        Status: 'error',
        error: 'Not verified',
    });
    return;
  }

  if (user_data.googleTokens.expires + 120 > Date.now() ) {
    await use_refresh_token(req.user.uid);
  }


  const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${user_data.googleTokens.access_token}&singleEvents=True&orderBy=startTime&timeMin=${minTime}&timeMax=${maxTime}`, {
    method: "GET",
    credentials: "omit",
    headers: {
        "Content-Type": "application/json",
    },
  });
  const data = await resp.json();

  if (resp.status == 200){
    res.json({
      Status: 'ok',
      data: data,
    });
    return;
  }
  res.json({
    Status: 'error',
    error: "Something went wrong",
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

router.get('/code', isAuthenticated, async function (req, res) {
  console.log(JSON.stringify(req.user));
  console.log(req.query.code)
  console.log(req.query.state)

  const state = await Google_schema.findOne({ _id: req.user.uid });

  console.log(state)

  if (state == null || req.query.state != state.state){
    res.json({
      Status: 'error',
      error: 'Invalid request',
  });
  return;
  }

  console.log("user")

  await useCode(req.query.code, req.user.uid)

  console.log("code used")


  res.redirect('https://localhost.edu');
}
);


module.exports = router;
