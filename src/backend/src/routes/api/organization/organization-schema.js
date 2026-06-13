import mongoose from "mongoose";

let organization = new mongoose.Schema({
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
export default Organization
