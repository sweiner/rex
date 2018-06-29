"use strict";
/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requirement_1 = require("../models/requirement");
const history_1 = require("../models/history");
const body_parser_1 = __importDefault(require("body-parser"));
// Assign router to the express.Router() instance
const router = express_1.Router();
const jsonParser = body_parser_1.default.json();
// @TODO modify the global browse to be efficient
router.get('/browse', (req, res, next) => {
    //Create an async request to obtain all of the requirements
    let promise = requirement_1.Requirement.find();
    promise.then((requirements) => {
        let simplified = requirements.map(requirement => {
            return requirement_1.simplify_requirement(requirement);
        });
        return res.json(simplified);
    })
        .catch(next);
});
router.get('/browse/:id', (req, res, next) => {
    // Extract the name from the request parameters
    let { id } = req.params;
    // Create an async request to find a particular requirement by reqid
    let promise = requirement_1.Requirement.findOne({ id: id });
    promise.then((requirement) => {
        if (requirement === null) {
            throw new Error("Requirement does not exist!");
        }
        let simplified = requirement_1.simplify_requirement(requirement);
        return res.json(simplified);
    })
        .catch(next);
});
router.post('/add/:id', jsonParser, (req, res, next) => {
    let { id } = req.params;
    if (req.body.data === undefined) {
        res.status(400);
        throw new Error("'data' field in the Requirement body is undefined!");
    }
    let req_promise = requirement_1.Requirement.create({ id: id, data: req.body.data, deleted: false });
    req_promise.then((requirement) => {
        //Create a new history item 
        if (!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }
        let hist_promise = history_1.History.create({ patch: {}, log: req.body.log });
        return Promise.all([requirement, hist_promise]);
    })
        .then((results) => {
        let requirement = results[0];
        let history = results[1];
        if (!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }
        requirement.history.push(history._id);
        requirement.save();
        let simplified = requirement_1.simplify_requirement(requirement);
        return res.json(simplified);
    })
        .catch(next);
});
router.post('/edit/:id', jsonParser, (req, res, next) => {
    let { id } = req.params;
    let query = { 'id': id };
    let req_promise = requirement_1.Requirement.findOne(query);
    // Create the history entry
    req_promise.then((requirement) => {
        if (!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }
        //Create a new history item
        let hist_promise = history_1.History.create({ patch: history_1.create_patch(requirement.data, req.body.data), log: req.body.log });
        requirement.data = req.body.data;
        return Promise.all([requirement, hist_promise]);
    })
        // Then save the new requirement
        .then((results) => {
        let requirement = results[0];
        let history = results[1];
        if (!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }
        requirement.history.push(history._id);
        requirement.save();
        let simplified = requirement_1.simplify_requirement(requirement);
        return res.json(simplified);
    })
        .catch(next);
});
// Developmental API
router.post('/delete', (req, res, next) => {
    let query = {};
    let promise = requirement_1.Requirement.updateMany(query, { deleted: true });
    promise.then((requirements) => {
        return res.json(requirements);
    })
        .catch(next);
});
router.post('/delete/:id', (req, res, next) => {
    let { id } = req.params;
    let query = { 'id': id };
    let req_promise = requirement_1.Requirement.findOne(query);
    req_promise.then((requirement) => {
        if (!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }
        else if (Object.keys(requirement.data).length === 0 && requirement.data.constructor === Object) {
            throw new Error('Requirement has already been deleted!');
        }
        let hist_promise = history_1.History.create({ patch: history_1.create_patch(requirement.data, {}) });
        requirement.data = {};
        return Promise.all([requirement, hist_promise]);
    })
        .then((results) => {
        let requirement = results[0];
        let history = results[1];
        if (!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }
        requirement.history.push(history._id);
        requirement.save();
        let simplified = requirement_1.simplify_requirement(requirement);
        return res.json(simplified);
    })
        .catch(next);
});
//@TODO this needs to be refactored
router.post('/restore/:id', (req, res, next) => {
    let { id } = req.params;
    let query = { 'id': id };
    let promise = requirement_1.Requirement.findOneAndUpdate(query, { deleted: false }, { new: true });
    promise.then((requirement) => {
        return res.json(requirement);
    })
        .catch(next);
});
//@TODO this needs to be refactored
router.post('/purge', (req, res, next) => {
    let query = { 'deleted': true };
    let promise = requirement_1.Requirement.remove(query);
    promise.then((requirement) => {
        return res.json(requirement);
    })
        .catch(next);
});
//@TODO this needs to be refactored
router.post('/purge/:id', (req, res, next) => {
    let { id } = req.params;
    let query = { 'id': id, 'deleted': true };
    let promise = requirement_1.Requirement.findOneAndRemove(query);
    promise.then((requirement) => {
        return res.json(requirement);
    })
        .catch(next);
});
// Export the express.Router() instance to be used by server.ts
exports.RequirementsController = router;
