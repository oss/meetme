const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let google_state = new Schema({
  _id: String,
  state: String,
  state_expires: Number,
  access_token: String,
  refresh_token: String,
  expires:Number,
});

const Google_state = mongoose.model('google_state', google_state);

module.exports = Google_state;
