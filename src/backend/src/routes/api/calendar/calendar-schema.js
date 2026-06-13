import mongoose from "mongoose";

const Schema = mongoose.Schema;

// TODO: mongodb natively supports modified times, maybe look into using that
// Update modified time in the metadata
let calendar = new Schema({
  _id: String,
  name: String,
  owner: { _id: String, isOrg: Boolean },
  description: String,
  location: String,
  created: Number,
  modified: Number,
  shareLink: Boolean,
  public: Boolean,
  meetingTime: { _id: false, start: Number, end: Number },
  timeblocks: [
    {
      _id: String,
      blocks: [{ _id: false, start: Number, end: Number }],
    },
  ],
  users: [{ _id: String, isPending: Boolean }],
  viewers: [{ _id: String }],
  links: [{ _id: false, name: String, url: String }],
  deleted: {
    _id: false,
    isDeleted: { type: Boolean, default: false },
    timeDeleted: Number,
  },
});

const Calendar = mongoose.model("calendars", calendar);

module.exports = Calendar;
