import mongoose from "mongoose";

const user = new mongoose.Schema({
  _id: String,
  alias: String,
  accountCreated: Number,
  lastSignin: Number,
  name: { _id: false, first: String, middle: String, last: String },
  calendars: [{ _id: String, isPending: Boolean }],
  organizations: [{ _id: String, isPending: Boolean }],
});
const User = mongoose.model("users", user);
export default User
