"use strict";
var router = require("express").Router();
var mongoose = require("mongoose");
var Poll = mongoose.model("Poll");
var cryptoRandomString = require("crypto-random-string");
mongoose.Promise = global.Promise;

router.get("/", function (req, res, next) {
    res.json({
        message: "hooray! welcome to our poll api!",
        path: req.path,
        url: req.url,
        baseUrl: req.baseUrl
    });
});

router.post("/init", function (req, res, next) {
    if (req.body.text === undefined || req.body.text === "") {
        return res.json({
            "response_type": "ephemeral",
            "text": "Please provide a prompt."
        });
    }

    var pollId = cryptoRandomString(32);
    var prompt = req.body.text;
    var schema = req.headers["x-forwarded-proto"];
    var apiUrl = schema + "://" + req.headers.host + req.baseUrl;

    res.json({
        "response_type": "in_channel",
        "attachments": [{
            "text": prompt,
            "actions": [{
                "name": "Vote Yes",
                "integration": {
                    "url": apiUrl + "/vote",
                    "context": {
                        "poll_id": pollId,
                        "vote": "Yes"
                    }
                }
            }, {
                "name": "Vote No",
                "integration": {
                    "url": apiUrl + "/vote",
                    "context": {
                        "poll_id": pollId,
                        "vote": "No"
                    }
                }
            }, {
                "name": "End Poll",
                "integration": {
                    "url": apiUrl + "/end-poll",
                    "context": {
                        "poll_id": pollId,
                        "prompt": prompt
                    }
                }
            }]
        }]
    });
});

router.post("/vote", function (req, res, next) {

    var _PollId = req.body.context.poll_id;
    var _UserId = req.body.user_id;

    Poll.findOne().where("PollId", _PollId).where("UserId", _UserId).then(function (poll) {
        var message = "Thanks for your vote!";
        if (poll) {
            poll.Vote = req.body.context.vote;
            message = "Your vote has been updated.";
        } else {
            poll = new Poll();
            poll.PollId = _PollId;
            poll.UserId = _UserId;
            poll.Vote = req.body.context.vote;
        }

        poll.save().then(function () {
            return res.json({
                "ephemeral_text": message
            });
        }, function (err) {
            return res.send(err);
        });
    }).catch(next);
});

router.post("/end-poll", function (req, res, next) {
    var _PollId = req.body.context.poll_id;
    Poll.distinct("Vote", {PollId: _PollId}).then(function (Votes) {
        console.log(Votes);
    });
});

module.exports = router;