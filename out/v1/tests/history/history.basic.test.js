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
describe('History Robustness', () => {
    test('Request a history on a requirement that does not exist', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/history/REQ001',
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
    test('Request a version on a requirement that does not exist', () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'GET',
            uri: server_location + '/requirements/history/REQ001/0',
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
    test('Request a non existing version of a requirement that does exist', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/REQ001',
            body: {
                data: {
                    name: 'Sample requirement',
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/REQ001/1',
            json: true
        };
        const put_response = yield request.put(put_options);
        try {
            const get_response = yield request.get(get_options);
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.NOT_FOUND);
            expect(err.response.body).toHaveProperty('message');
        }
    }));
    test('Verify a requirement update does not affect the previous history item', () => __awaiter(this, void 0, void 0, function* () {
        const pre_put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/Five',
            body: {
                data: {
                    name: 'Sample requirement',
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/Five',
            body: {
                data: {
                    name: 'Sample requirement modified',
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/Five',
            resolveWithFullResponse: true,
            json: true
        };
        yield request.put(pre_put_options);
        const put_response = yield request.put(put_options);
        const get_response = yield request.get(get_options);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body).toBeInstanceOf(Array);
        expect(get_response.body).toHaveLength(2);
        expect(get_response.body[0].version).toEqual(0);
        expect(get_response.body[0].log).toBeUndefined;
    }));
    test('Verify a duplicate edit does not impact the history', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/Five',
            body: {
                data: {
                    name: 'Sample requirement modified',
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/Five',
            resolveWithFullResponse: true,
            json: true
        };
        const put_response = yield request.put(put_options);
        const get_response = yield request.get(get_options);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body).toBeInstanceOf(Array);
        expect(get_response.body).toHaveLength(2);
    }));
    test('Verify a duplicate edit with a log entry gets ignored', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/Five',
            body: {
                data: {
                    name: 'Sample requirement modified',
                },
                log: 'This is a log entry'
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/Five',
            resolveWithFullResponse: true,
            json: true
        };
        const put_response = yield request.put(put_options);
        const get_response = yield request.get(get_options);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body).toBeInstanceOf(Array);
        expect(get_response.body).toHaveLength(2);
        expect(get_response.body[1].version).toBe(1);
        expect(get_response.body[1].log).toBeUndefined;
    }));
    test('Verify an invalid log entry gets rejected', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/Five',
            body: {
                data: {
                    name: 'Requirement with bad log entry',
                },
                log: { bad: 'This is a bad', log: 'log entry' }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/Five',
            resolveWithFullResponse: true,
            json: true
        };
        try {
            const put_response = yield request.put(put_options);
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('message');
        }
        const get_response = yield request.get(get_options);
        expect(get_response.body).toBeInstanceOf(Array);
        expect(get_response.body).toHaveLength(2);
    }));
    test('Verify an invalid log edit gets rejected', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/history/Five/0/log',
            body: {
                log: { bad: 'This is a bad', log: 'log entry' }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/Five',
            resolveWithFullResponse: true,
            json: true
        };
        try {
            const put_response = yield request.put(put_options);
        }
        catch (err) {
            expect(err.response.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(err.response.body).toHaveProperty('message');
        }
        const get_response = yield request.get(get_options);
        expect(get_response.body).toBeInstanceOf(Array);
        expect(get_response.body).toHaveLength(2);
        expect(get_response.body.log).toBeUndefined;
    }));
});
describe('History Browsing', () => {
    test('Verify history version starts at zero for a new requirement', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/new',
            body: {
                data: {
                    name: 'Sample requirement',
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/new',
            resolveWithFullResponse: true,
            json: true
        };
        const put_response = yield request.put(put_options);
        const get_response = yield request.get(get_options);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body).toBeInstanceOf(Array);
        expect(get_response.body).toHaveLength(1);
        expect(get_response.body[0].version).toEqual(0);
    }));
    test('Verify history versions increment', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/1',
            body: {
                data: {
                    name: '',
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/1',
            resolveWithFullResponse: true,
            json: true
        };
        let put_response = null;
        let get_response = null;
        for (let i = 0; i < 100; i++) {
            put_options.body.data.name = 'Requirement Edit ' + i.toString();
            put_response = yield request.put(put_options);
            get_response = yield request.get(get_options);
            expect(get_response.statusCode).toBe(HttpStatus.OK);
            expect(get_response.body).toBeInstanceOf(Array);
            expect(get_response.body[i].version).toEqual(i);
        }
        expect(get_response.body).toHaveLength(100);
    }));
    test('Verify logs are inserted correctly', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/2',
            body: {
                data: {
                    name: 'Requirement with log',
                },
                log: 'This is the log'
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/2',
            resolveWithFullResponse: true,
            json: true
        };
        const put_response = yield request.put(put_options);
        const get_response = yield request.get(get_options);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body).toBeInstanceOf(Array);
        expect(get_response.body[0].version).toEqual(0);
        expect(get_response.body[0].log).toBe('This is the log');
    }));
    test('Verify a history can be created without a log', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/3',
            body: {
                data: {
                    name: 'Requirement without log',
                },
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/3',
            resolveWithFullResponse: true,
            json: true
        };
        const put_response = yield request.put(put_options);
        const get_response = yield request.get(get_options);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body).toBeInstanceOf(Array);
        expect(get_response.body[0].version).toEqual(0);
        expect(get_response.body[0].log).toBeUndefined;
    }));
});
describe('History Versions', () => {
    test('Verify current versions of requirement edits', () => __awaiter(this, void 0, void 0, function* () {
        const put_options_0 = {
            method: 'PUT',
            uri: server_location + '/requirements/version',
            body: {
                data: {
                    name: 'Requirement',
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options_0 = {
            method: 'GET',
            uri: server_location + '/requirements/history/version/0',
            resolveWithFullResponse: true,
            json: true
        };
        const expected_data_0 = {
            name: 'Requirement'
        };
        const put_options_1 = {
            method: 'PUT',
            uri: server_location + '/requirements/version',
            body: {
                data: {
                    name: 'Requirement has been edited',
                    new: 'With new field',
                    new_object: { and: 'and', a: 'an', object: 'object' }
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options_1 = {
            method: 'GET',
            uri: server_location + '/requirements/history/version/1',
            resolveWithFullResponse: true,
            json: true
        };
        const expected_data_1 = {
            name: 'Requirement has been edited',
            new: 'With new field',
            new_object: { and: 'and', a: 'an', object: 'object' }
        };
        let put_response = yield request.put(put_options_0);
        let get_response = yield request.get(get_options_0);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body).toBeInstanceOf(Object);
        expect(get_response.body.data).toEqual(expected_data_0);
        put_response = yield request.put(put_options_1);
        get_response = yield request.get(get_options_1);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body).toBeInstanceOf(Object);
        expect(get_response.body.data).toEqual(expected_data_1);
    }));
    test('Verify previous versions of requirement edits', () => __awaiter(this, void 0, void 0, function* () {
        const put_options_0 = {
            method: 'PUT',
            uri: server_location + '/requirements/prev_version',
            body: {
                data: {
                    name: 'Previous Requirement',
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options_0 = {
            method: 'GET',
            uri: server_location + '/requirements/history/prev_version/0',
            resolveWithFullResponse: true,
            json: true
        };
        const expected_data_0 = {
            name: 'Previous Requirement'
        };
        const put_options_1 = {
            method: 'PUT',
            uri: server_location + '/requirements/prev_version',
            body: {
                data: {
                    name: 'Requirement has been edited',
                    new: 'With new field',
                    new_object: { and: 'and', a: 'an', object: 'object' }
                }
            },
            resolveWithFullResponse: true,
            json: true
        };
        yield request.put(put_options_0);
        yield request.put(put_options_1);
        const get_response = yield request.get(get_options_0);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body).toBeInstanceOf(Object);
        expect(get_response.body.data).toEqual(expected_data_0);
    }));
});
describe('History log edits', () => {
    test('Verify we can add a log to a version without one', () => __awaiter(this, void 0, void 0, function* () {
        const put_options = {
            method: 'PUT',
            uri: server_location + '/requirements/no_log',
            body: {
                data: {
                    name: 'Requirement without log',
                },
            },
            resolveWithFullResponse: true,
            json: true
        };
        const get_options = {
            method: 'GET',
            uri: server_location + '/requirements/history/no_log',
            resolveWithFullResponse: true,
            json: true
        };
        const log_put_opts = {
            method: 'PUT',
            uri: server_location + '/requirements/history/no_log/0/log',
            body: {
                log: 'This is the new log'
            },
            resolveWithFullResponse: true,
            json: true
        };
        let put_response = yield request.put(put_options);
        let get_response = yield request.get(get_options);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body[0].log).toBeUndefined;
        put_response = yield request.put(log_put_opts);
        get_response = yield request.get(get_options);
        expect(get_response.statusCode).toBe(HttpStatus.OK);
        expect(get_response.body[0].log).toBe('This is the new log');
    }));
});
//# sourceMappingURL=history.basic.test.js.map