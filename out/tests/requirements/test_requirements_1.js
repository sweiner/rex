"use strict";
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
const mocha = __importStar(require("mocha"));
const request = __importStar(require("request"));
const chai = __importStar(require("chai"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = require("../../server");
const server_location = "http://localhost:3000";
const database = "mongodb://localhost/test";
mocha.describe('Requirements Browsing - Basic', function () {
    mocha.before(function (done) {
        let promise = server_1.startServer(database);
        promise.then((connection) => {
            done();
        })
            .catch((reason) => {
            console.error('ERROR: Could not connect to MongoDB... Aborting');
            process.exit(1);
        });
    });
    mocha.it('Should return null when an non-existant ID is accessed', function (done) {
        let req = request.get(server_location + '/requirements/browse/REQ001', function (err, res, body) {
            chai.expect(body).to.equal('null');
            done();
        });
    });
    mocha.it('Should return a requirement record when created', function (done) {
        let data = { description: 'This is a sample requirement' };
        let options = {
            method: 'POST',
            body: { data: data },
            json: true
        };
        request.post(server_location + '/requirements/create/REQ001', options, function (err, res, body) {
            chai.expect(body.data).to.deep.equal(data);
            chai.expect(body.id).to.equal('REQ001');
            chai.expect(body._id).to.exist;
            chai.expect(body.deleted).to.equal(false);
            chai.expect(body.history).to.be.empty;
            done();
        });
        mocha.after(function () {
            let promise = mongoose_1.default.connection.dropDatabase();
            promise.then((value) => {
                server_1.stopServer();
            })
                .catch((reason) => {
                console.log(reason);
                server_1.stopServer();
            });
        });
    });
});
