/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

// @TODO - add more robust processing on routes
import { NextHandleFunction } from 'connect';
import { Router, Request, Response } from 'express';
import { Requirement, IRequirementModel } from '../models/requirement';
import { History, createPatch, IHistoryModel } from '../models/history';
import { Schema, DocumentQuery } from 'mongoose';
import { HistoryController } from './history.controller';
import bodyParser from 'body-parser';
import * as HttpStatus from 'http-status-codes';
import HttpError from 'http-errors';

// Assign router to the express.Router() instance
const router: Router = Router();
const jsonParser: NextHandleFunction = bodyParser.json();

// Attach the history controller
router.use('/history', HistoryController);

// @TODO modify the global browse to be efficient
router.get('/', (req: Request, res: Response, next: (...args: any[]) => void) => {
    // Create an async request to obtain all of the requirements
    const promise = Requirement.find({}, 'name data -_id').lean();

    promise.then((requirements) => {
        res.status(HttpStatus.OK);
        res.json(requirements);
    })
    .catch(next);
});

router.get('/:name', (req: Request, res: Response, next: (...args: any[]) => void) => {
    // Extract the name from the request parameters
    const { name } = req.params;

    // Create an async request to find a particular requirement by name
    const query: DocumentQuery<IRequirementModel | null, IRequirementModel> = Requirement.findOne({name: name}, 'name data -_id').lean();
    query.exec();

    query.then((requirement) => {
        if (requirement === null) {
            throw HttpError(HttpStatus.NOT_FOUND, name + ' does not exist!');
        }
        res.json(requirement);
    })
    .catch(next);
});

router.put('/:name', jsonParser, (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { name } = req.params;
    const conditions = { 'name': name };
    const query: DocumentQuery<IRequirementModel | null, IRequirementModel> = Requirement.findOne(conditions);

    if (!req.body.data) {
        throw HttpError(HttpStatus.BAD_REQUEST, 'Data field missing from requirement body.  See /api-docs for details');
    }
    else if (typeof(req.body.data) != 'object') {
        throw HttpError(HttpStatus.BAD_REQUEST, 'Data field must contain an object.  See /api-docs for details');
    }

    const req_promise: Promise<IRequirementModel | null> = query.exec();

    // Create the new requirement if it does not exist
    req_promise.then((requirement) => {
        if (!requirement) {
            // Returns the updated requirement document if newly created
            res.status(HttpStatus.CREATED);
            const create_promise = Requirement.create({name: name, data: req.body.data});
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
        let patch: any | null = null;

        if (res.statusCode == HttpStatus.CREATED) {
            // The history for a new requirement will start off with a blank patch
            patch = {};
        }
        else {
            // Get the patch data for any updates
            patch = createPatch(requirement.data!, req.body.data);

            // If there are no changes to this requirement, then do not update the model
            if (patch === null) {
                // Breaking out of promise chain to avoid updating requirement history.
                // Want to send OK here so that PUT is idempotent.
                throw res.status(HttpStatus.OK);
            }
        }

        const hist_promise = History.create({patch: patch, log: req.body.log});
        requirement.data = req.body.data;


        return Promise.all([requirement, hist_promise]);
    })
    // Then link history to the requirement and save
    .then((results) => {
        const requirement: IRequirementModel = results[0];
        const history: IHistoryModel = results[1];

        // Push the history ID
        requirement.history!.push(history._id);
        // Update the history version number
        history.version = (requirement.history!.length - 1);

        // Save both models
        const updated_hist_promise = history.save();
        const updated_req_promise = requirement.save();

        return Promise.all([updated_hist_promise, updated_req_promise]);
    })
    .then ((results) => {
        res.sendStatus(res.statusCode);
    })
    .catch((err) => {
        if (err instanceof Error) { throw err; }
        else { res.sendStatus(res.statusCode); }
    })
    .catch(next);
});

router.delete('/:name', (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { name } = req.params;
    const conditions = { 'name': name };

    const query: DocumentQuery<IRequirementModel | null, IRequirementModel> = Requirement.findOne(conditions);
    const req_promise: Promise<IRequirementModel | null> = query.exec();

    req_promise.then((requirement) => {
        if (!requirement) {
            throw HttpError(HttpStatus.NOT_FOUND, name + ' does not exist!');
        }
        else if (Object.keys(requirement.data!).length === 0 && requirement.data!.constructor === Object) {
            throw HttpError(HttpStatus.BAD_REQUEST, name + ' has already been deleted!');
        }

        const hist_promise: Promise<IHistoryModel> = History.create({patch: createPatch(requirement.data!, <Schema.Types.Mixed> {})});

        requirement.data = <Schema.Types.Mixed> {};
        return Promise.all([requirement, hist_promise]);
    })
    .then((results) => {
        const requirement: IRequirementModel = results[0];
        const history: IHistoryModel = results[1];

        requirement.history!.push(history._id);
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
export const RequirementsController: Router = router;