/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

import * as request from 'request-promise-native';
import * as HttpStatus from 'http-status-codes';

import { startServer, stopServer } from '../../../server';
import MongodbMemoryServer from 'mongodb-memory-server';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const server_location = 'http://localhost:3000';
let mongod: MongodbMemoryServer | null = null;

beforeAll( async () => {
    const options: any = {
        binary: {
            version: '4.0.0'
        }
    };
    mongod = new MongodbMemoryServer(options);
    const uri = await mongod.getConnectionString();
    await startServer(uri);
});

afterAll(async () => {
    await stopServer();
    if (mongod) {
        await mongod.stop();
    }
});

describe('History Robustness', () => {
    test('Request a history on a requirement that does not exist', async () => {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/history/REQ001',
            json: true
        };

        try {
            const response = await request.get(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.NOT_FOUND);
            expect(err.response.body).toHaveProperty('message');
        }
    });
});