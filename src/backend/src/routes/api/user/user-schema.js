import mongoose from "mongoose";

const Schema = mongoose.Schema;

const user = new Schema({
  _id: String,
  alias: String,
  accountCreated: Number,
  lastSignin: Number,
  name: { _id: false, first: String, middle: String, last: String },
  calendars: [{ _id: String, isPending: Boolean }],
  organizations: [{ _id: String, isPending: Boolean }],
});

const User = mongoose.model("users", user);

module.exports = User;
