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
const dbURI = 'mongodb://localhost/test';

beforeAll( async () => {
    mongod = new MongodbMemoryServer();

    try {
        const uri = await mongod.getConnectionString();
        await startServer(uri);
    }
    catch (err) {
        stopServer();
    }
});

describe('Requirement Creation Robustness', () => {
    test('Request a non-existing requirement', async () => {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
            json: true
        };

        try {
            const response = await request.get(options);
            fail();
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('error');
        }
    });

    test('Create a requirement without data', async () => {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                name: 'Test Requirement'
            },
            json: true
        };

        try {
            const response = await request.put(options);
            fail();
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('error');
        }
    });

    test('Create a requirement with malformed data field', async () => {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                data: 'This should be an object'
            },
            json: true
        };

        try {
            const response = await request.put(options);
            fail();
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('error');
        }
    });
});

describe('Requirement Creation', async () => {
    test('Create a basic requirement', async () => {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                data: {
                    name: 'It doesnt matter what my name is',
                    description: 'Behold, this is REQ001'
                }
            },
            resolveWithFullResponse: true,
            json: true
        };

        const response = await request.put(options);
        expect(response.statusCode).toBe(HttpStatus.CREATED);
    });

    test('Verify requirement was created successfully', async () => {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };

        const response = await request.get(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body.name).toBe('REQ001');
        expect(response.body.data.name).toBe('It doesnt matter what my name is');
        expect(response.body.data.description).toBe('Behold, this is REQ001');
    });

    test('Verify we cannot create a duplicate requirement', async () => {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                data: {
                    name: 'A different name',
                    description: 'Behold, this is REQ001s doppleganger'
                }
            },
            resolveWithFullResponse: true,
            json: true
        };

        try {
            const response = await request.put(options);
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('error');
        }
    });
});

afterAll(async() => {
    await stopServer();
    if (mongod) {
        await mongod.stop();
    }
});