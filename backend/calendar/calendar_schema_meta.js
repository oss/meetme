const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let calendar = new Schema({
    _id: String,
    name: String,
    location: String,
    created:Number,
    modified:Number,
    shareLink:Boolean,
    meetingTime: {
        start: Number,
        end: Number,
    },
    owner: {
        owner_type: String,
        _id: String,
    },
    description: [
        {
            name: String,
            data: String,
            _id: false,
        },
    ],
    public: Boolean,
});

const Calendar = mongoose.model('calendar_meta', calendar);

module.exports = Calendar;
