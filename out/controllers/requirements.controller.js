"use strict";
// @TODO - add more robust processing on routes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requirement_1 = require("../models/requirement");
const body_parser_1 = __importDefault(require("body-parser"));
// Assign router to the express.Router() instance
const router = express_1.Router();
const jsonParser = body_parser_1.default.json();
// The / here corresponds to the route that the welcome controller
// is mounted on in the server.ts file
// In this case it's /welcome
router.get('/browse', (req, res) => {
    //Create an async request to obtain all of the requirements
    let promise = requirement_1.Requirement.find();
    promise.then((requirements) => {
        res.json(requirements);
    });
    promise.catch((reason) => {
        let err = { 'error': reason };
        return res.json(err);
    });
});
router.get('/browse/:id', (req, res) => {
    // Extract the name from the request parameters
    let { id } = req.params;
    // Create an async request to find a particular requirement by reqid
    let promise = requirement_1.Requirement.findOne({ id: id });
    promise.then((requirement) => {
        res.json(requirement);
    });
    promise.catch((reason) => {
        let err = { 'error': reason };
        return res.json(err);
    });
});
router.post('/add/:id', jsonParser, (req, res) => {
    let { id } = req.params;
    if (!req.body) {
        return res.sendStatus(400);
    }
    // @TODO add validation on JSON
    let promise = requirement_1.Requirement.create({ id: id, data: req.body.data, deleted: false });
    promise.then((requirement) => {
        res.json(requirement);
    });
    promise.catch((reason) => {
        let err = { 'error': reason };
        return res.json(err);
    });
});
router.post('/edit/:id', jsonParser, (req, res) => {
    let { id } = req.params;
    let query = { 'id': id };
    if (!req.body) {
        return res.sendStatus(400);
    }
    let promise = requirement_1.Requirement.findOneAndUpdate(query, { data: req.body.data }, { new: true });
    promise.then((doc) => {
        return res.json(doc);
    });
    promise.catch((reason) => {
        let err = { 'error': reason };
        return res.json(err);
    });
});
// Developmental API
router.post('/delete', (req, res) => {
    let query = {};
    let promise = requirement_1.Requirement.updateMany(query, { deleted: true });
    promise.then((doc) => {
        return res.json(doc);
    });
    promise.catch((reason) => {
        let err = { 'error': reason };
        return res.json(err);
    });
});
router.post('/delete/:id', (req, res) => {
    let { id } = req.params;
    let query = { 'id': id };
    let promise = requirement_1.Requirement.findOneAndUpdate(query, { deleted: true }, { new: true });
    promise.then((doc) => {
        return res.json(doc);
    });
    promise.catch((reason) => {
        let err = { 'error': reason };
        return res.json(err);
    });
});
router.post('/restore/:id', (req, res) => {
    let { id } = req.params;
    let query = { 'id': id };
    let promise = requirement_1.Requirement.findOneAndUpdate(query, { deleted: false }, { new: true });
    promise.then((doc) => {
        return res.json(doc);
    });
    promise.catch((reason) => {
        let err = { 'error': reason };
        return res.json(err);
    });
});
router.post('/purge', (req, res) => {
    let query = { 'deleted': true };
    let promise = requirement_1.Requirement.remove(query);
    promise.then((doc) => {
        return res.json(doc);
    });
    promise.catch((reason) => {
        let err = { 'error': reason };
        return res.json(err);
    });
});
router.post('/purge/:id', (req, res) => {
    let { id } = req.params;
    let query = { 'id': id, 'deleted': true };
    let promise = requirement_1.Requirement.findOneAndRemove(query);
    promise.then((doc) => {
        return res.json(doc);
    });
    promise.catch((reason) => {
        let err = { 'error': reason };
        return res.json(err);
    });
});
// Export the express.Router() instance to be used by server.ts
exports.RequirementsController = router;
