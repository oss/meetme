const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let calendar = new Schema({
    _id: String,
    owner: {
        owner_type: String,
        _id: String,
    },
    blocks: [{ start: Number, end: Number, _id: false }],
    users: [
        {
            _id: String,
            times: [{ start: Number, end: Number, _id: false }],
        },
    ],
    pendingUsers: [
        {
            _id: String,
        },
    ],
    viewers: [
        {
            _id: String,
        },
    ],
    links: [
        {
            name: String,
            URL: String,
            _id: false,
        },
    ],
    deleted: {
        isDeleted: { type: Boolean, default: false },
        timeDeleted: Number,
    },
});
const Calendar = mongoose.model('calendar_main', calendar);

module.exports = Calendar;
