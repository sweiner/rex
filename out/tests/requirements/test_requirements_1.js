"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha = __importStar(require("mocha"));
const request = __importStar(require("request"));
const chai = __importStar(require("chai"));
const server_1 = require("../../server");
const server_location = "http://localhost:3000";
const database = "mongodb://localhost/test";
mocha.describe('Requirements Browsing - Basic', function () {
    mocha.before(function () {
        server_1.startServer(database);
    });
    mocha.it('Should return null when an non-existant ID is accessed', function () {
        let req = request.get(server_location + '/requirements/browse/REQ001', function (res) {
            chai.expect(res).to.equal([]);
        });
    });
    mocha.it('Should return a requirement record when created', function () {
        let req = request.post(server_location + '/requirements/create/REQ001', {
            body: {
                'data': {
                    'description': 'This is a sample requirement'
                }
            }
        }, function (res) {
            chai.expect(res).to.contain.keys('data');
        });
    });
    mocha.after(function () {
        server_1.stopServer();
    });
});
