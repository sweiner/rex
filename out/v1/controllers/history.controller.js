"use strict";
/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requirement_1 = require("../models/requirement");
const history_1 = require("../models/history");
const body_parser_1 = __importDefault(require("body-parser"));
const HttpStatus = __importStar(require("http-status-codes"));
const http_errors_1 = __importDefault(require("http-errors"));
// Assign router to the express.Router() instance
const router = express_1.Router();
const jsonParser = body_parser_1.default.json();
// Display all history for a given requirement
router.get('/:name', (req, res, next) => {
    const { name } = req.params;
    const conditions = { 'name': name };
    const query = requirement_1.Requirement.findOne(conditions);
    query.exec();
    query.then((requirement) => {
        if (requirement === null) {
            throw http_errors_1.default(HttpStatus.NOT_FOUND, name + ' does not exist!');
        }
        return requirement;
    })
        .then((requirement) => {
        const populated = requirement.populate({ path: 'history', model: 'History', select: 'version log -_id' });
        return populated.execPopulate();
    })
        .then((requirement) => {
        res.json(requirement.history);
    })
        .catch(next);
});
// Display the numbered version
router.get('/:name/:version', (req, res, next) => {
    const { name, version } = req.params;
    const conditions = { 'name': name };
    const query = requirement_1.Requirement.findOne(conditions).populate({ path: 'history', model: 'History', select: 'version patch log -_id' }).exec();
    query.then((requirement) => {
        if (!requirement) {
            throw http_errors_1.default(HttpStatus.BAD_REQUEST, 'Requirement does not exist!');
        }
        else if (version >= requirement.history.length) {
            throw http_errors_1.default(HttpStatus.BAD_REQUEST, 'Version ' + version.toString() + ' of ' + name + ' does not exist!');
        }
        const reconstructed_data = requirement;
        for (let i = (requirement.history.length - 1); i > version; i--) {
            reconstructed_data.data = history_1.applyPatch(reconstructed_data.data, requirement.history[i].patch);
        }
        const reconstructed_data_object = reconstructed_data.toObject();
        res.json(reconstructed_data_object);
    })
        .catch(next);
});
// Update a log message
router.put('/:name/:version/log', jsonParser, (req, res, next) => {
    const { name, version } = req.params;
    const conditions = { 'name': name };
    if (!req.body.log) {
        throw http_errors_1.default(HttpStatus.BAD_REQUEST, 'Log field missing from body');
    }
    const query = requirement_1.Requirement.findOne(conditions).exec();
    query.then((requirement) => {
        if (!requirement) {
            throw http_errors_1.default(HttpStatus.BAD_REQUEST, name + ' does not exist!');
        }
        else if (version >= requirement.history.length) {
            throw http_errors_1.default(HttpStatus.BAD_REQUEST, 'Version ' + version.toString() + ' of ' + name + ' does not exist!');
        }
        const hist_promise = history_1.History.findById(requirement.history[version]).exec();
        return hist_promise;
    })
        .then((history) => {
        history.log = req.body.log;
        history.save();
        res.sendStatus(HttpStatus.OK);
    })
        .catch(next);
});
// Export the express.Router() instance to be used by server.ts
exports.HistoryController = router;
//# sourceMappingURL=history.controller.js.map