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
            expect(err.response.body.error).toContain('Requirement does not exist');
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
            expect(err.response.body.error).toContain('Data field missing');
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
            expect(err.response.body.error).toContain('Data field must contain an object');
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
});

afterAll(async() => {
    await stopServer();
    if (mongod) {
        await mongod.stop();
    }
});


// mocha.describe('Requirements Creation - Basic', function() {
//     mocha.before(function() {
//         const promise = startServer(database);
//         return promise.then((connection: any) => {
//         })
//         .catch((reason: any) => {
//             console.error('ERROR: Could not connect to MongoDB... Aborting');
//             process.exit(1);
//         });
//     });

//     mocha.it('Should return an error when a non-existent requirement is accessed', function(done) {
//         const req = request.get(server_location + '/requirements/REQ001', function(err, res, body) {
//             chai.expect(res.statusCode).to.equal(HttpStatus.BAD_REQUEST);
//             done();
//         });
//     });

//     mocha.it('Should return a created response when created', function(done) {
//         const data = { data: 'This is a sample requirement' };
//         const options: request.CoreOptions = {
//             method: 'PUT',
//             body: data,
//             json: true
//           };

//         request.put(server_location + '/requirements/REQ001', options, function(err, res, body) {
//             chai.expect(res.statusCode).to.equal(HttpStatus.CREATED);
//             done();
//         });
//     });

//     mocha.it('Should reject the creation of a new requirement with an ID that matches an existing one', function (done) {
//         const data = { description: 'This is a sample requirement' };
//         const options: request.CoreOptions = {
//             method: 'POST',
//             body: data,
//             json: true
//           };

//         request.post(server_location + '/requirements/create/REQ001', options, function(err, res, body) {

//             chai.expect(body.data).to.be.undefined;
//             chai.expect(body.id).to.be.undefined;
//             chai.expect(body._id).to.be.undefined;
//             chai.expect(body.deleted).to.be.undefined;
//             chai.expect(body.history).to.be.undefined;

//             // Error params
//             chai.expect(body.error.code).to.equal(11000);
//             chai.expect(body.error.message).contains('duplicate key error');

//             done();
//         });
//     });

//     mocha.it('Should create a requirement with blank data if the body is empty', function (done) {
//         const options: request.CoreOptions = {
//             method: 'POST',
//             json: true
//           };

//           const req = request.post(server_location + '/requirements/create/REQ002', options, function(err, res, body) {
//             chai.expect(body.data).to.deep.equal({});
//             chai.expect(body.id).to.equal('REQ002');
//             chai.expect(body._id).to.exist;
//             chai.expect(body.deleted).to.equal(false);
//             chai.expect(body.history).to.have.length(1);
//             done();
//         });
//     });

//     mocha.after(function() {
//         const promise = mongoose.connection.dropDatabase();

//         promise.then((value) => {
//             stopServer();
//             return promise;
//         })
//         .catch ((reason) => {
//             console.log(reason);
//             stopServer();
//             return promise;
//         });

//     });
// });