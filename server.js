"use strict";
// BASE SETUP
// -----------------------------------------------------------------------------
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var morgan = require("morgan");

var isProduction = process.env.NODE_ENV === "production";
var port = process.env.PORT || 8080; // set our port

var app = express();
app.use(morgan("dev")); // log requests to the console
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// DATABASE SETUP
var dbname = "mip-db";
var uri = "mongodb://localhost/" + dbname;
var options = {
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};
if (isProduction) {
    mongoose.connect(process.env.MONGODB_URI, options);
} else {
    mongoose.connect(uri, options);
    mongoose.set("debug", true);
}

// Models lives here
require("./app/models/poll");

// ROUTES FOR OUR API
// -----------------------------------------------------------------------------
// middleware to use for all requests
app.use(function (req, res, next) {
    // do logging
    console.log("Something is happening.");
    next();
});

app.use(require("./app/routes"));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function (err, req, res, next) {
        console.log(err.stack);

        res.status(err.status || 500);

        res.json({"errors": {
            message: err.message,
            error: err
        }});
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({"errors": {
        message: err.message,
        error: {}
    }});
});

// START THE SERVER
// -----------------------------------------------------------------------------
var server = app.listen(port, function () {
    console.log("Magic happens on port " + server.address().port);
});