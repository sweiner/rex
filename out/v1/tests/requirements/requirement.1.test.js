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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = __importStar(require("request-promise-native"));
const HttpStatus = __importStar(require("http-status-codes"));
const server_1 = require("../../../server");
const mongodb_memory_server_1 = __importDefault(require("mongodb-memory-server"));
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
const server_location = 'http://localhost:3000';
let mongod = null;
const dbURI = 'mongodb://localhost/test';
beforeAll(() => __awaiter(this, void 0, void 0, function* () {
    mongod = new mongodb_memory_server_1.default();
    try {
        const uri = yield mongod.getConnectionString();
        yield server_1.startServer(uri);
    }
    catch (err) {
        server_1.stopServer();
    }
}));
describe('Requirement Creation Robustness', () => {
    test('Request a non-existing requirement', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
            json: true
        };
        try {
            const response = yield request.get(options);
            fail();
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body.error).toContain('Requirement does not exist');
        }
    }));
    test('Create a requirement without data', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                name: 'Test Requirement'
            },
            json: true
        };
        try {
            const response = yield request.put(options);
            fail();
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body.error).toContain('Data field missing');
        }
    }));
    test('Create a requirement with malformed data field', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                data: 'This should be an object'
            },
            json: true
        };
        try {
            const response = yield request.put(options);
            fail();
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body.error).toContain('Data field must contain an object');
        }
    }));
});
describe('Requirement Creation', () => __awaiter(this, void 0, void 0, function* () {
    test('Create a basic requirement', () => __awaiter(this, void 0, void 0, function* () {
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
        const response = yield request.put(options);
        expect(response.statusCode).toBe(HttpStatus.CREATED);
    }));
    test('Verify requirement was created successfully', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };
        const response = yield request.get(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body.name).toBe('REQ001');
        expect(response.body.data.name).toBe('It doesnt matter what my name is');
        expect(response.body.data.description).toBe('Behold, this is REQ001');
    }));
}));
afterAll(() => __awaiter(this, void 0, void 0, function* () {
    yield server_1.stopServer();
    if (mongod) {
        yield mongod.stop();
    }
}));
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
//# sourceMappingURL=requirement.1.test.js.map