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

describe('Requirement Robustness', () => {
    test('Request a non-existing requirement', async () => {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
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
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('message');
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
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('message');
        }
    });

    test('Delete a requirement that does not exist', async () => {
        const options = {
            method: 'DELETE',
            uri: server_location + '/requirements/REQ001',
            json: true
        };

        try {
            const response = await request.delete(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.NOT_FOUND);
            expect(err.response.body).toHaveProperty('message');
        }
    });
});

describe('Test Data Field Limitations', () => {
    test('Create a requirement with a \'.\' in one of the data fields (MongoDB Limitation)', async () => {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                'data': {
                    'description': 'This is now a different requirement',
                    'trace': {
                        'main.c': ['100', '200-250', '500'],
                        'main.h': ['50']
                    }
                }
            },
            resolveWithFullResponse: true,
            json: true
        };

        try {
            const response = await request.put(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        }
    });

    test('Create a requirement with a \'$\' in one of the data fields (MongoDB Limitation)', async () => {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                'data': {
                    '$bill': 'This is a bad field',
                }
            },
            resolveWithFullResponse: true,
            json: true
        };

        try {
            const response = await request.put(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        }
    });
});

describe('Requirement Creation', () => {
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
        expect(response.body.data.name).toBe('It doesnt matter what my name is');
        expect(response.body.data.description).toBe('Behold, this is REQ001');
    });
});

describe('Requirement Editing', () => {
    test('Verify we can edit an already existing requirement', async () => {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                data: {
                    description: 'This is now a different requirement',
                    trace: {
                        files: ['main.c', 'main.h', 'run.c']
                    }
                }
            },
            resolveWithFullResponse: true,
            json: true
        };

        const response = await request.put(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
    });

    test('Verify the edit was successful', async () => {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };

        const expected_data = {
            description: 'This is now a different requirement',
            trace: {
                files: ['main.c', 'main.h', 'run.c']
            }
        };

        const response = await request.get(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body.data).toEqual(expected_data);
    });

    test('Test a duplicate edit', async () => {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                data: {
                    description: 'This is now a different requirement',
                    trace: {
                        files: ['main.c', 'main.h', 'run.c']
                    }
                }
            },
            resolveWithFullResponse: true,
            json: true
        };

        const response = await request.put(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
    });

    test('Verify the edit was ignored', async () => {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };

        const expected_data = {
            description: 'This is now a different requirement',
            trace: {
                files: ['main.c', 'main.h', 'run.c']
            }
        };

        const response = await request.get(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body.data).toEqual(expected_data);
    });
});

describe('Requirement Deletion', () => {
    test('Verify we can delete an existing requirement', async () => {
        const options = {
            method: 'DELETE',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };

        const response = await request.delete(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
    });

    test('Verify requirement was deleted successfully', async () => {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };

        const response = await request.get(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body.data).toEqual({});
    });

    test('Verify we cannot delete a requirement multiple times', async () => {
        const options = {
            method: 'DELETE',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };

        try {
            const response = await request.delete(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('message');
        }
    });
});