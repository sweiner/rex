/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

// Import everything from express and assign it to the express variable
import express from 'express';
import mongoose, { ValidationError } from 'mongoose';
import * as http from 'http';
import * as db from './db';

// Import WelcomeController from controllers entry point
import { Socket } from 'net';
import { Version1Controller } from './v1/controllers/version.controller';
import { HttpError } from 'http-errors';
import { timeout, TimeoutError } from 'promise-timeout';
import * as HttpStatus from 'http-status-codes';

// Local functions
function normalizePort(val: number | string): number | string | boolean {
    const port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
}

// Create a new express application instance
const app: express.Application = express();
// The port the express app will listen on
export const port: number | string | boolean = normalizePort(process.env.PORT || 3000);
// Variable to hold the server for programmatic testing
let server: http.Server | null = null;
// List of active connections for graceful server shutdown
let connections: Socket[]  = [];

// Export server creation for use in testing
// The promise is for use in testing to ensure the database connection has
// been established before trying to access elements
export async function startServer(database?: string): Promise<void> {
    // Connect to Mongo
    const db_promise: Promise<typeof mongoose> = db.connect(database);

    // Attach version controllers
    app.use('/', Version1Controller);
    app.use('/v1', Version1Controller);

    // Define error handling middleware
    app.use(function(err: Error, req: express.Request, res: express.Response, next: ((value?: any) => void)) {
        if (err instanceof HttpError) {
            res.status(err.status);
            res.json(err);
        }
        else if (err instanceof mongoose.Error && err.name == 'ValidationError') {
            res.status(HttpStatus.BAD_REQUEST);
            res.json({'message': err.message});
        }
        else {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        next();
    });

    // Serve the application at the given port
    server = app.listen(port);

    server.on('connection', connection => {
        connections.push(connection);
        connection.on('close', () => connections = connections.filter(curr => curr !== connection));
    });

    // Wait for the database connection to be established.
    await db_promise;
}

export function stopServer(): Promise<[void, void]> | Promise<void> {

    if (server) {
        // console.log('Received kill signal, shutting down gracefully');
        // console.log('Disconnecting from MongoDB...');
        // Disconnect from MongoDB.
        const mongo_close = db.disconnect();
        // Close the server
        const server_close = new Promise<void>(resolve => server!.close(resolve));

        // Terminate all the connections
        connections.forEach(curr => curr.end());

        // Set up a timer
        const server_close_timeout = timeout(server_close, 5000)
        .then( () => {
            // All connections to http server closed, resolve the promise
            return Promise.resolve();
        })
        .catch((err) => {
            // Timeout occured, try destroying the connections
            if (err instanceof TimeoutError) {
                connections.forEach(curr => curr.destroy());
                return timeout(server_close, 5000);
            }
            return Promise.reject(err);
        })
        .then( () => {
            // All connections closed, resolve the promise
            return Promise.resolve();
        })
        .catch((err) => {
            // Server still not closed, force termination
            if (err instanceof TimeoutError) {
                return Promise.reject('Could not shutdown server gracefully.  Terminating');
            }
            return Promise.reject(err);
        });

        // All connections closed (Mongo, HttpSever)
        return Promise.all([mongo_close, server_close_timeout]);
    }
    return Promise.resolve();
}

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