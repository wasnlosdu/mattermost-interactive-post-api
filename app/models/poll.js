"use strict";
// app/models/poll.js
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PollSchema = new Schema({
    PollId: String,
    UserId: String,
    Vote: String
});

module.exports = mongoose.model('Poll', PollSchema);