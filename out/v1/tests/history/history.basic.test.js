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
});
//# sourceMappingURL=history.basic.test.js.map