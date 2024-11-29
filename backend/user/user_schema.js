const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let user = new Schema({
  _id: String,
  alias: String,
  account_created: Number,
  last_signin: Number,
  name: {
    _id: false,
    first: String,
    middle: String,
    last: String,
  },
  //all calendars that the person has access to
  calendars: [
    {
      _id: String,
    },
  ],
  organizations: [
    {
      _id: String,
    },
  ],
  pendingCalendars: [
    {
      _id: String,
    },
  ],
  pendingOrganizations: [
    {
      _id: String,
    },
  ],
  googleTokens:{
    access_token: String,
    refresh_token: String,
    expires:Number,
  }
});

const User = mongoose.model('users', user);

module.exports = User;
