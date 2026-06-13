import mongoose from "mongoose";

const Schema = mongoose.Schema;

let organization = new Schema({
  _id: String,
  name: String,
  created: Number,
  owner: String,
  calendars: [{ _id: String }],
  members: [
    {
      _id: String,
      role: {
        type: String,
        enum: ["admin", "editor", "member", "pending"],
      },
    },
  ],
  viewers: [{ _id: String }],
});

const Organization = mongoose.model("organizations", organization);

module.exports = Organization;
