"use strict";
/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import everything from express and assign it to the express variable
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const db = __importStar(require("./db"));
const version_controller_1 = require("./v1/controllers/version.controller");
const http_errors_1 = require("http-errors");
const HttpStatus = __importStar(require("http-status-codes"));
// Local functions
function normalizePort(val) {
    const port = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port))
        return val;
    else if (port >= 0)
        return port;
    else
        return false;
}
// Create a new express application instance
const app = express_1.default();
// The port the express app will listen on
exports.port = normalizePort(process.env.PORT || 3000);
// Variable to hold the server for programmatic testing
let server = null;
// List of active connections for graceful server shutdown
let connections = [];
// Export server creation for use in testing
// The promise is for use in testing to ensure the database connection has
// been established before trying to access elements
function startServer(database) {
    return __awaiter(this, void 0, void 0, function* () {
        // Connect to Mongo
        const db_promise = db.connect(database);
        // Attach version controllers
        app.use('/', version_controller_1.Version1Controller);
        app.use('/v1', version_controller_1.Version1Controller);
        // Define error handling middleware
        app.use(function (err, req, res, next) {
            if (err instanceof http_errors_1.HttpError) {
                res.status(err.status);
                res.json(err);
            }
            else if (err instanceof mongoose_1.default.Error) {
                if (err.name == 'ValidationError') {
                    res.status(HttpStatus.BAD_REQUEST);
                    res.json({ 'message': err.message });
                }
                else {
                    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            else {
                res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            }
            next();
        });
        // Serve the application at the given port
        server = app.listen(exports.port);
        server.on('connection', connection => {
            connections.push(connection);
            connection.on('close', () => connections = connections.filter(curr => curr !== connection));
        });
        // Wait for the database connection to be established.
        yield db_promise;
    });
}
exports.startServer = startServer;
function stopServer() {
    if (server) {
        // console.log('Received kill signal, shutting down gracefully');
        // console.log('Disconnecting from MongoDB...');
        // Disconnect from MongoDB.
        // Will create an async task, we do not need to wait for it though
        // Since the server will remain open until it completes.
        db.disconnect();
        // Close the server
        server.close(() => {
            // console.log('Closed out remaining connections');
            if (kill_timeout) {
                clearTimeout(kill_timeout);
            }
            if (destroy_timeout) {
                clearTimeout(destroy_timeout);
            }
        });
        const kill_timeout = setTimeout(() => {
            throw new Error('Could not close connections in time, forcefully shutting down');
        }, 10000);
        connections.forEach(curr => curr.end());
        const destroy_timeout = setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
    }
}
exports.stopServer = stopServer;
// Handle Abrupt server shutdowns
process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);
// Start the server when the app is run directly
if (require.main === module) {
    try {
        startServer();
    }
    catch (err) {
        throw new Error('Could not start the server');
    }
}
//# sourceMappingURL=server.js.map