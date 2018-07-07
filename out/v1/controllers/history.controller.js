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
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error('Requirement does not exist!');
        }
        return requirement;
    })
        .then((requirement) => {
        const populated = requirement.populate({ path: 'history', model: 'History', select: 'version log -_id' });
        return populated.execPopulate();
    })
        .then((requirement) => {
        return res.json(requirement.history);
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
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error('Requirement does not exist!');
        }
        else if (!requirement.history || !requirement.data) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error('Error - Requirement data or history is corrupted!');
        }
        else if (version >= requirement.history.length) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error('Version ' + version.toString() + ' of ' + name + ' does not exist!');
        }
        const reconstructed_data = requirement;
        for (let i = (requirement.history.length - 1); i > version; i--) {
            reconstructed_data.data = history_1.apply_patch(reconstructed_data.data, requirement.history[i].patch);
        }
        const reconstructed_data_object = reconstructed_data.toObject();
        return res.json(reconstructed_data_object);
    })
        .catch(next);
});
// Update a log message
router.put('/:name/:version/log', jsonParser, (req, res, next) => {
    const { name, version } = req.params;
    const conditions = { 'name': name };
    if (!req.body.log) {
        res.status(HttpStatus.BAD_REQUEST);
        throw new Error('Log field missing from body');
    }
    const query = requirement_1.Requirement.findOne(conditions).exec();
    query.then((requirement) => {
        if (!requirement) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error('Requirement does not exist!');
        }
        else if (!requirement.history || !requirement.data) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error('Error - Requirement data or history is corrupted!');
        }
        else if (version >= requirement.history.length) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error('Version ' + version.toString() + ' of ' + name + ' does not exist!');
        }
        const hist_promise = history_1.History.findById(requirement.history[version]).exec();
        return hist_promise;
    })
        .then((history) => {
        if (!history) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error('Unable to locate ' + name + ' history for version ' + version);
        }
        history.log = req.body.log;
        history.save();
        return res.sendStatus(HttpStatus.OK);
    })
        .catch(next);
});
// Export the express.Router() instance to be used by server.ts
exports.HistoryController = router;
//# sourceMappingURL=history.controller.js.map