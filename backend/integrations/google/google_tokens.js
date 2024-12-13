const express = require('express');
const router = express.Router();
const Google_schema = require('./google_state_schema');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../../auth/passport/util');
const crypto =  require("crypto");

const config = require("#config");
const fs = require("fs");

const GOOGLE_CREDENTIALS = JSON.parse(fs.readFileSync(config.google_oauth_credentials))

async function create_access_token(uid){

    const user_data = await Google_schema.findOne({ _id: uid });

    const fetch_response = await fetch(`https://oauth2.googleapis.com/token`, {
        method: "POST",
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id: GOOGLE_CREDENTIALS.client_id,
            client_secret: GOOGLE_CREDENTIALS.client_secret,
            refresh_token: user_data.refresh_token,
            grant_type: "refresh_token"
        }),
    })
    const data = await fetch_response.json();

    user_data.access_token = data.access_token;
    user_data.expires = Date.now() + data.expires_in * 1000;
    await user_data.save();

    return data.access_token;
}

async function create_new_nonce(netid){
    const exists = await Google_schema.findOne({ _id: netid });
    const timeObject = Date.now() + 3 * 60000;
    const new_state_random_val = crypto.randomUUID();

    if (exists === null){
        const google_state = new Google_schema();
        google_state._id = netid;
        google_state.state = new_state_random_val;
        google_state.state_expires = timeObject;
        google_state.access_token = null;
        google_state.refresh_token = null;
        await google_state.save();
    }
    else {
        exists.state = new_state_random_val;
        exists.state_expires = timeObject;
        await exists.save();
    }

    return new_state_random_val;
}

router.delete('/revoke', isAuthenticated, async function (req, res, next) {

    const timeObject = new Date();

    const user_data = await Google_schema.deleteOne({ _id: req.user.uid });

    res.json({
        Status: 'ok',
    });
});

router.get('/enable', isAuthenticated, async function (req, res, next) {
    const new_nonce =  await create_new_nonce(req.user.uid);

    const link = `https://accounts.google.com/o/oauth2/v2/auth?scope=${config.google_scopes}&access_type=offline&include_granted_scopes=true&response_type=code&prompt=consent&state=`+new_nonce+`&redirect_uri=${config.backend_domain}/int/google_code&client_id=${GOOGLE_CREDENTIALS.client_id}`

    res.json({
        Status: 'ok',
        link: link,
    });
});

router.post('/validate', isAuthenticated, async function (req, res, next) {
  const user_data = await Google_schema.findOne({ _id: req.user.uid });

    if (user_data == null) {
        res.status(424).json({
            Status: 'error',
            error: 'Not verified',
        });
        return;
    }

    const resp = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user_data.access_token}`, {
        method: "GET",
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await resp.json();

    if (resp.status === 200){
        res.json({
            Status: 'ok',
        });
        return;
    }

    res.status(424).json({
      Status: 'error',
      error: "not validated",
    });
});

router.post('/google_cal_dates', isAuthenticated, async function (req, res, next) {

  const user_data = await Google_schema.findOne({ _id: req.user.uid });

  if (user_data == null) {
        res.json({
            Status: 'error',
            error: 'google integration not completed',
        });
        return;
    }

    if (/^[0-9]+$/.test(req.body.minTime) || /^[0-9]+$/.test(req.body.maxTime) ){
        res.json({
            Status: 'error',
            error: 'invalid min/max time',
        });
        return;
    }

    const minTime = parseInt(req.body.minTime);
    const maxTime = parseInt(req.body.maxTime);


    if (user_data.expires < Date.now() + 120000 ) {
        user_data.access_token = await create_access_token(req.user.uid);
    }

    const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${user_data.access_token}&singleEvents=True&orderBy=startTime&timeMin=${minTime}&timeMax=${maxTime}`, {
        method: "GET",
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
        },
    });
    
    const data = await resp.json();

    if (resp.status !== 200){
        throw new Error("error getting your calendar");
    }
    res.json({
        Status: 'ok',
        data: data,
    });
    
});

router.get('/callback', isAuthenticated, async function (req, res, next) {
    const google_integration_info = await Google_schema.findOne({ _id: req.user.uid });
    const code = req.query.code;

    if (google_integration_info === null || (req.query.state !== google_integration_info.state) )
        throw new Error("google state mismatch");

    if (google_integration_info.state_expires < Date.now())
        throw new Error("state is expired");

    const fetch_data = await fetch(`https://oauth2.googleapis.com/token`, {
        method: "POST",
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code: code,
            client_id: GOOGLE_CREDENTIALS.client_id,
            client_secret: GOOGLE_CREDENTIALS.client_secret,
            redirect_uri: config.backend_domain+'/integrations/google/callback',
            grant_type:"authorization_code"
        }),
    });

    const data = await fetch_data.json();

    if (data.error === "invalid_grant"){
        throw new Error("invalid grant");
    }

    google_integration_info.access_token  = data.access_token;
    google_integration_info.refresh_token = data.refresh_token;
    google_integration_info.expires       = Date.now() + data.expires_in * 1000;
    await google_integration_info.save();
    res.redirect( config.frontend_domain );
});

module.exports = router;
