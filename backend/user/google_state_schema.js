const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let google_state = new Schema({
  _id: String,
  account_created: Number,
  createdAt: { type: Date, expires: '3m', default: Date.now }
});

const Google_state = mongoose.model('google_state', google_state);

module.exports = Google_state;
