"use strict";
/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// @TODO this needs to be parameterized
const dbURI = 'mongodb://localhost/rex';
// Create the database connection
function connect(database) {
    if (database === undefined) {
        return mongoose_1.default.connect(dbURI);
    }
    else {
        return mongoose_1.default.connect(database);
    }
}
exports.connect = connect;
function disconnect() {
    return mongoose_1.default.connection.close();
}
exports.disconnect = disconnect;
// CONNECTION EVENTS
// When successfully connected
mongoose_1.default.connection.on('connected', function () {
    // console.log('Mongoose default connection open');
});
// If the connection throws an error
mongoose_1.default.connection.on('error', function (err) {
    // console.log('Mongoose default connection error: ' + err);
});
// When the connection is disconnected
mongoose_1.default.connection.on('disconnected', function () {
    // console.log('Mongoose default connection disconnected');
});
