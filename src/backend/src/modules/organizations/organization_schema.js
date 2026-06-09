const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let organization = new Schema({
    _id: String,
    name: String,
    created:Number,
    owner: String,
    calendars: [
        {
            _id: String,
        },
    ],
    admins: [
        {
            _id: String,
        },
    ],
    editors: [
        {
            _id: String,
        },
    ],
    members: [
        {
            _id: String,
        },
    ],
    viewers: [
        {
            _id: String,
        },
    ],
    pendingMembers: [
        {
            _id: String,
        },
    ],
});

organization.methods.hasAdmin = function hasAdmin(id) {
    return this.owner === id || this.admins.some((item) => item._id === id);
}

const Organizations = mongoose.model('organization', organization);

module.exports = Organizations;
