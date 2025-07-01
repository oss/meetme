const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let google_state = new Schema({
    _id: String,
    state: String,                // this is like a nonce or a random value, google uses weird terminology
    state_expires: Number,        // utc minutes
    access_token: String,         // short term
    refresh_token: String,        // long term
    expires: Number,
});

const Google_state = mongoose.model('google_state', google_state);

module.exports = Google_state;
