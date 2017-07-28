/**
* @description : Main entry point for the server
* @author : Saket Joshi
* @version : 1.0
*/

"use strict";

// List out all the dependencies for the NodeJs server
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var jsforce = require("jsforce");
var app = express();

var __jsCache = {};

// Make available the app folder
app.use(express.static(path.join(__dirname, "app")));

// Parse JSON body for POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// To parse the cookies sent in the request
app.use(cookieParser());

// Start the server on port #3000
app.listen(3000, function() {
    console.log("Node server started on port 3000");
});

// Utility method to simplify request and response
var returnJson = function (req, res, errors, result) {
    if (errors) respondFailure(req, res, errors);
    else respondSuccess(req, res, result);
}

var respondFailure = function (req, res, errors) {
    // @TODO: Implement response for errors
    console.error(errors);
    res.status(400);
    res.send(JSON.stringify(errors));
}

var respondSuccess = function (req, res, result) {
    res.status(200);
    res.send(JSON.stringify(result));
}

// Setup the library for Salesforce connection
var connection = function (req) {
    var options = {
        instanceUrl: req.cookies.SF_INSTANCE_URL,
        accessToken: req.cookies.SF_ACCESS_TOKEN
    };

    // We will check if the access token is already used or not
    // ...i.e. if the connection is already established or not
    // If yes, then we return the existing connection
    // else setup a new connection and store it in the cache
    if (__jsCache[options.accessToken] == null) {    
        __jsCache[options.accessToken] = new jsforce.Connection(options);
    }

    return __jsCache[options.accessToken];
}

// Setup SF endpoints to be used by the app
app.get("/services/meta/describe", function (req, res) {
    connection(req).describeGlobal(function (errors, meta) {
        returnJson(req, res, errors, meta);
    });
});