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
const server_1 = require("../../server");
const server_location = "http://localhost:3000";
const database = "mongodb://localhost/test";
mocha.describe('History - Basic', function () {
    mocha.before(function () {
        server_1.startServer(database);
    });
    mocha.it('Should be empty on a newly created Requirement', function () {
        let req = request.get(server_location + '/requirements', function (res) {
            console.log(res);
        });
    });
    mocha.after(function () {
        server_1.stopServer();
    });
});
