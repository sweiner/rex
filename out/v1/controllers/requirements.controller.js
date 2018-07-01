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
// Assign router to the express.Router() instance
const router = express_1.Router();
const jsonParser = body_parser_1.default.json();
// Attach the history controller
router.use('/history', history_controller_1.HistoryController);
// @TODO modify the global browse to be efficient
router.get('/browse', (req, res, next) => {
    // Create an async request to obtain all of the requirements
    const promise = requirement_1.Requirement.find({}, 'name data -id').lean();
    promise.then((requirements) => {
        res.status(HttpStatus.OK);
        return res.json(requirements);
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
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error('Requirement does not exist!');
        }
        return res.json(requirement);
    })
        .catch(next);
});
router.put('/:name', jsonParser, (req, res, next) => {
    const { name } = req.params;
    const conditions = { 'name': name };
    const query = requirement_1.Requirement.findOne(conditions);
    if (!req.body.data) {
        res.status(HttpStatus.BAD_REQUEST);
        throw new Error('Data field missing from requirement body');
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
        let hist_promise = null;
        if (res.statusCode == HttpStatus.CREATED) {
            // The history for a new requirement will start off with a blank patch
            hist_promise = history_1.History.create({ patch: {}, log: req.body.log });
        }
        else {
            if (requirement.data === undefined) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                throw new Error('Could not update requirement history.  Previous requirement data is undefined.');
            }
            // Get the patch data for any updates
            const patch = history_1.create_patch(requirement.data, req.body.data);
            // If there are no changes to this requirement, then do not update the model
            if (patch === null) {
                hist_promise = Promise.resolve(null);
            }
            else {
                hist_promise = history_1.History.create({ patch: patch, log: req.body.log });
                requirement.data = req.body.data;
            }
        }
        return Promise.all([requirement, hist_promise]);
    })
        // Then link history to the requirement and save
        .then((results) => {
        const requirement = results[0];
        const history = results[1];
        // If there is a change to this requirement, then save it.  Otherwise, ignore the request.
        if (history !== null) {
            if (!requirement) {
                throw new Error(name + 'does not exist!');
            }
            else if (requirement.history === undefined || requirement.data === undefined) {
                throw new Error('Error creating document history');
            }
            // Push the history ID
            requirement.history.push(history._id);
            // Update the history version number
            history.version = (requirement.history.length - 1);
            // Save both models
            history.save();
            requirement.save();
        }
        return res.sendStatus(res.statusCode);
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
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error(name + ' does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error('Error creating document history');
        }
        else if (Object.keys(requirement.data).length === 0 && requirement.data.constructor === Object) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error('Requirement has already been deleted!');
        }
        const hist_promise = history_1.History.create({ patch: history_1.create_patch(requirement.data, {}) });
        requirement.data = {};
        return Promise.all([requirement, hist_promise]);
    })
        .then((results) => {
        const requirement = results[0];
        const history = results[1];
        requirement.history.push(history._id);
        requirement.save();
        return res.sendStatus(HttpStatus.NO_CONTENT);
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
