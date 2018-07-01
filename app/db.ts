/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

import mongoose from 'mongoose';

// @TODO this needs to be parameterized
const dbURI = 'mongodb://localhost/rex';

// Create the database connection
export function connect(database?: string): Promise<typeof mongoose> {
    if (database === undefined) {
        return mongoose.connect(dbURI);
    }
    else {
        return mongoose.connect(database);
    }
}

export function disconnect(): Promise<void> {
    return mongoose.connection.close();
}

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    // console.log('Mongoose default connection open');
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
    // console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    // console.log('Mongoose default connection disconnected');
});
