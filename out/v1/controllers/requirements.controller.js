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
// @TODO modify the global browse to be efficient
router.get("/browse", (req, res, next) => {
    // Create an async request to obtain all of the requirements
    const promise = requirement_1.Requirement.find({}, "id data").lean();
    promise.then((requirements) => {
        res.status(HttpStatus.OK);
        return res.json(requirements);
    })
        .catch(next);
});
router.get("/:id", (req, res, next) => {
    // Extract the name from the request parameters
    const { id } = req.params;
    // Create an async request to find a particular requirement by reqid
    const promise = requirement_1.Requirement.findOne({ id: id }).lean();
    promise.then((requirement) => {
        if (requirement === null) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Requirement does not exist!");
        }
        return res.json(requirement);
    })
        .catch(next);
});
router.put("/:id", jsonParser, (req, res, next) => {
    const { id } = req.params;
    const conditions = { "id": id };
    const query = requirement_1.Requirement.findOne(conditions);
    const req_promise = query.exec();
    // Create the new requirement if it does not exist
    req_promise.then((requirement) => {
        if (!requirement) {
            // Returns the updated requirement document if newly created
            res.status(HttpStatus.CREATED);
            const create_promise = requirement_1.Requirement.create({ id: id, data: req.body.data });
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
                throw new Error("Could not update requirement history.  Previous requirement data is undefined.");
            }
            // Get the patch data for any updates
            const patch = history_1.create_patch(requirement.data, req.body.data);
            // If there are no changes to this requirement, then do not update the model
            if (patch === null) {
                hist_promise = Promise.resolve(null);
            }
            else {
                hist_promise = history_1.History.create({ patch: patch });
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
                throw new Error(id + "does not exist!");
            }
            else if (requirement.history === undefined || requirement.data === undefined) {
                throw new Error("Error creating document history");
            }
            requirement.history.push(history._id);
            requirement.save();
        }
        return res.sendStatus(res.statusCode);
    })
        .catch(next);
});
router.post("/delete/:id", (req, res, next) => {
    const { id } = req.params;
    const query = { "id": id };
    const req_promise = requirement_1.Requirement.findOne(query);
    req_promise.then((requirement) => {
        if (!requirement) {
            throw new Error(id + "does not exist!");
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error("Error creating document history");
        }
        else if (Object.keys(requirement.data).length === 0 && requirement.data.constructor === Object) {
            throw new Error("Requirement has already been deleted!");
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
        const simplified = simplify_requirement(requirement);
        return res.json(simplified);
    })
        .catch(next);
});
// @TODO this needs to be refactored
router.post("/restore/:id", (req, res, next) => {
    const { id } = req.params;
    const query = { "id": id };
    const promise = requirement_1.Requirement.findOneAndUpdate(query, { deleted: false }, { new: true });
    promise.then((requirement) => {
        return res.json(requirement);
    })
        .catch(next);
});
// @TODO this needs to be refactored
router.post("/purge", (req, res, next) => {
    const query = { "deleted": true };
    const promise = requirement_1.Requirement.remove(query);
    promise.then((requirement) => {
        return res.json(requirement);
    })
        .catch(next);
});
// @TODO this needs to be refactored
router.post("/purge/:id", (req, res, next) => {
    const { id } = req.params;
    const query = { "id": id, "deleted": true };
    const promise = requirement_1.Requirement.findOneAndRemove(query);
    promise.then((requirement) => {
        return res.json(requirement);
    })
        .catch(next);
});
// Export the express.Router() instance to be used by server.ts
exports.RequirementsController = router;
