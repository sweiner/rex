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
const history_controller_1 = require("./history.controller");
const body_parser_1 = __importDefault(require("body-parser"));
const HttpStatus = __importStar(require("http-status-codes"));
const http_errors_1 = __importDefault(require("http-errors"));
// Assign router to the express.Router() instance
const router = express_1.Router();
const jsonParser = body_parser_1.default.json();
// Attach the history controller
router.use('/history', history_controller_1.HistoryController);
// @TODO modify the global browse to be efficient
router.get('/', (req, res, next) => {
    // Create an async request to obtain all of the requirements
    const promise = requirement_1.Requirement.find({}, 'name data -_id').lean();
    promise.then((requirements) => {
        res.status(HttpStatus.OK);
        res.json(requirements);
    })
        .catch(next);
});
router.get('/:name', (req, res, next) => {
    // Extract the name from the request parameters
    const { name } = req.params;
    // Create an async request to find a particular requirement by name
    const query = requirement_1.Requirement.findOne({ name: name }, 'name data -_id').lean();
    query.exec();
    query.then((requirement) => {
        if (requirement === null) {
            throw http_errors_1.default(HttpStatus.NOT_FOUND, name + ' does not exist!');
        }
        res.json(requirement);
    })
        .catch(next);
});
router.put('/:name', jsonParser, (req, res, next) => {
    const { name } = req.params;
    const conditions = { 'name': name };
    const query = requirement_1.Requirement.findOne(conditions);
    if (!req.body.data) {
        throw http_errors_1.default(HttpStatus.BAD_REQUEST, 'Data field missing from requirement body.  See /api-docs for details');
    }
    else if (typeof (req.body.data) != 'object') {
        throw http_errors_1.default(HttpStatus.BAD_REQUEST, 'Data field must contain an object.  See /api-docs for details');
    }
    const req_promise = query.exec();
    // Create the new requirement if it does not exist
    req_promise.then((requirement) => {
        if (!requirement) {
            // Returns the updated requirement document if newly created
            res.status(HttpStatus.CREATED);
            const create_promise = requirement_1.Requirement.create({ name: name, data: req.body.data });
            return create_promise;
        }
        else {
            // Returns the old requirement document if modifications are needed
            res.status(HttpStatus.OK);
            return requirement;
        }
    })
        // Create the history record
        .then((requirement) => {
        let patch = null;
        if (res.statusCode == HttpStatus.CREATED) {
            // The history for a new requirement will start off with a blank patch
            patch = {};
        }
        else {
            if (requirement.data === undefined) {
                throw http_errors_1.default(HttpStatus.INTERNAL_SERVER_ERROR, 'Could not update requirement history.  Previous requirement data is corrupted.');
            }
            // Get the patch data for any updates
            patch = history_1.createPatch(requirement.data, req.body.data);
            // If there are no changes to this requirement, then do not update the model
            if (patch === null) {
                // Breaking out of promise chain to avoid updating requirement history.
                // Want to send OK here so that PUT is idempotent.
                throw res.sendStatus(HttpStatus.OK);
            }
        }
        const hist_promise = history_1.History.create({ patch: patch, log: req.body.log });
        requirement.data = req.body.data;
        return Promise.all([requirement, hist_promise]);
    })
        // Then link history to the requirement and save
        .then((results) => {
        const requirement = results[0];
        const history = results[1];
        // Push the history ID
        requirement.history.push(history._id);
        // Update the history version number
        history.version = (requirement.history.length - 1);
        // Save both models
        const updated_hist_promise = history.save();
        const updated_req_promise = requirement.save();
        return Promise.all([updated_hist_promise, updated_req_promise]);
    })
        .then((results) => {
        res.sendStatus(res.statusCode);
    })
        .catch((err) => {
        if (err instanceof Error) {
            throw err;
        }
    })
        .catch(next);
});
router.delete('/:name', (req, res, next) => {
    const { name } = req.params;
    const conditions = { 'name': name };
    const query = requirement_1.Requirement.findOne(conditions);
    const req_promise = query.exec();
    req_promise.then((requirement) => {
        if (!requirement) {
            throw http_errors_1.default(HttpStatus.NOT_FOUND, name + ' does not exist!');
        }
        else if (Object.keys(requirement.data).length === 0 && requirement.data.constructor === Object) {
            throw http_errors_1.default(HttpStatus.BAD_REQUEST, name + ' has already been deleted!');
        }
        const hist_promise = history_1.History.create({ patch: history_1.createPatch(requirement.data, {}) });
        requirement.data = {};
        return Promise.all([requirement, hist_promise]);
    })
        .then((results) => {
        const requirement = results[0];
        const history = results[1];
        requirement.history.push(history._id);
        requirement.save();
        res.sendStatus(HttpStatus.NO_CONTENT);
    })
        .catch(next);
});
// @TODO this needs to be an admin interface
// @TODO it also needs to clean up the history items associated with a requirement
// router.post('/purge', (req: Request, res: Response, next: (...args: any[]) => void) => {
//     const query = { 'data': {} };
//     const promise = Requirement.remove(query);
//     promise.then((requirement) => {
//         return res.sendStatus(HttpStatus.NO_CONTENT);
//     })
//     .catch(next);
// });
// Export the express.Router() instance to be used by server.ts
exports.RequirementsController = router;
//# sourceMappingURL=requirements.controller.js.map