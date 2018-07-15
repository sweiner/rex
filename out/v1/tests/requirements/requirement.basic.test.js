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
beforeAll(() => __awaiter(this, void 0, void 0, function* () {
    const options = {
        binary: {
            version: '4.0.0'
        }
    };
    mongod = new mongodb_memory_server_1.default(options);
    const uri = yield mongod.getConnectionString();
    yield server_1.startServer(uri);
}));
afterAll(() => __awaiter(this, void 0, void 0, function* () {
    yield server_1.stopServer();
    if (mongod) {
        yield mongod.stop();
    }
}));
describe('Requirement Robustness', () => {
    test('Request a non-existing requirement', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
            json: true
        };
        try {
            const response = yield request.get(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.NOT_FOUND);
            expect(err.response.body).toHaveProperty('message');
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
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('message');
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
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('message');
        }
    }));
    test('Delete a requirement that does not exist', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'DELETE',
            uri: server_location + '/requirements/REQ001',
            json: true
        };
        try {
            const response = yield request.delete(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.NOT_FOUND);
            expect(err.response.body).toHaveProperty('message');
        }
    }));
});
describe('Test Data Field Limitations', () => {
    test('Create a requirement with a \'.\' in one of the data fields (MongoDB Limitation)', () => __awaiter(this, void 0, void 0, function* () {
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
            const response = yield request.put(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        }
    }));
    test('Create a requirement with a \'$\' in one of the data fields (MongoDB Limitation)', () => __awaiter(this, void 0, void 0, function* () {
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
            const response = yield request.put(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        }
    }));
});
describe('Requirement Creation', () => {
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
        expect(response.body.data.name).toBe('It doesnt matter what my name is');
        expect(response.body.data.description).toBe('Behold, this is REQ001');
    }));
});
describe('Requirement Editing', () => {
    test('Verify we can edit an already existing requirement', () => __awaiter(this, void 0, void 0, function* () {
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
        const response = yield request.put(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
    }));
    test('Verify the edit was successful', () => __awaiter(this, void 0, void 0, function* () {
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
        const response = yield request.get(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body.data).toEqual(expected_data);
    }));
    test('Test a duplicate edit', () => __awaiter(this, void 0, void 0, function* () {
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
        const response = yield request.put(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
    }));
    test('Verify the edit was ignored', () => __awaiter(this, void 0, void 0, function* () {
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
        const response = yield request.get(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body.data).toEqual(expected_data);
    }));
});
describe('Requirement Deletion', () => {
    test('Verify we can delete an existing requirement', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'DELETE',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };
        const response = yield request.delete(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
    }));
    test('Verify requirement was deleted successfully', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };
        const response = yield request.get(options);
        expect(response.statusCode).toBe(HttpStatus.OK);
        expect(response.body.data).toEqual({});
    }));
    test('Verify we cannot delete a requirement multiple times', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'DELETE',
            uri: server_location + '/requirements/REQ001',
            resolveWithFullResponse: true,
            json: true
        };
        try {
            const response = yield request.delete(options);
            fail('We expected an error in the response, but did not get one');
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('message');
        }
    }));
});
//# sourceMappingURL=requirement.basic.test.js.map