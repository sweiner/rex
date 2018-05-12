"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dbURI = 'mongodb://localhost/rex';
// Create the database connection
function connect() {
    mongoose_1.default.connect(dbURI);
}
exports.connect = connect;
// CONNECTION EVENTS
// When successfully connected
mongoose_1.default.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);
});
// If the connection throws an error
mongoose_1.default.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});
// When the connection is disconnected
mongoose_1.default.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
    mongoose_1.default.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});
