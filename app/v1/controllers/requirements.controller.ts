/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

// @TODO - add more robust processing on routes
import { NextHandleFunction } from 'connect';
import { Router, Request, Response } from 'express';
import { Requirement, IRequirementModel } from '../models/requirement';
import { History, create_patch, IHistoryModel } from '../models/history';
import { Schema, DocumentQuery } from 'mongoose';
import bodyParser from 'body-parser';
import * as HttpStatus from 'http-status-codes';

// Assign router to the express.Router() instance
const router: Router = Router();
const jsonParser: NextHandleFunction = bodyParser.json();

// @TODO modify the global browse to be efficient
router.get('/browse', (req: Request, res: Response, next: (...args: any[]) => void) => {
    // Create an async request to obtain all of the requirements
    const promise = Requirement.find({}, 'id data').lean();

    promise.then((requirements) => {
        res.status(HttpStatus.OK);
        return res.json(requirements);
    })
    .catch(next);
});

router.get('/:id', (req: Request, res: Response, next: (...args: any[]) => void) => {
    // Extract the name from the request parameters
    const { id } = req.params;

    // Create an async request to find a particular requirement by reqid
    const promise = Requirement.findOne({id: id}, 'id data').lean();

    promise.then((requirement) => {
        if (requirement === null) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error ('Requirement does not exist!');
        }

        return res.json(requirement);
    })
    .catch(next);
});

router.put('/:id', jsonParser, (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { id } = req.params;
    const conditions = { 'id': id };
    const query: DocumentQuery<IRequirementModel | null, IRequirementModel> = Requirement.findOne(conditions);
    const req_promise: Promise<IRequirementModel | null> = query.exec();

    // Create the new requirement if it does not exist
    req_promise.then((requirement) => {
        if (!requirement) {
            // Returns the updated requirement document if newly created
            res.status(HttpStatus.CREATED);
            const create_promise = Requirement.create({id: id, data: req.body.data});
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
        let hist_promise: Promise<IHistoryModel | null> | null = null;

        if (res.statusCode == HttpStatus.CREATED) {
            // The history for a new requirement will start off with a blank patch
            hist_promise = History.create({patch: {}, log: req.body.log});
        }
        else {
            if ( requirement.data === undefined ) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                throw new Error('Could not update requirement history.  Previous requirement data is undefined.');
            }

            // Get the patch data for any updates
            const patch: any | null = create_patch(requirement.data, req.body.data);

            // If there are no changes to this requirement, then do not update the model
            if (patch === null) {
                hist_promise = Promise.resolve(null);
            }
            else {
                hist_promise = History.create({patch: patch});
                requirement.data = req.body.data;
            }
        }

        return Promise.all([requirement, hist_promise]);
    })
    // Then link history to the requirement and save
    .then((results) => {
        const requirement: IRequirementModel = results[0];
        const history: IHistoryModel | null = results[1];

        // If there is a change to this requirement, then save it.  Otherwise, ignore the request.
        if (history !== null) {
            if (!requirement) {
                throw new Error(id + 'does not exist!');
            }
            else if (requirement.history === undefined || requirement.data === undefined) {
                throw new Error('Error creating document history');
            }

            requirement.history.push(history._id);
            requirement.save();
        }

        return res.sendStatus(res.statusCode);
    })
    .catch(next);
});

router.delete('/:id', (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { id } = req.params;
    const conditions = { 'id': id };

    const query: DocumentQuery<IRequirementModel | null, IRequirementModel> = Requirement.findOne(conditions);
    const req_promise: Promise<IRequirementModel | null> = query.exec();

    req_promise.then((requirement) => {
        if (!requirement) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error('Error creating document history');
        }
        else if (Object.keys(requirement.data).length === 0 && requirement.data.constructor === Object) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error('Requirement has already been deleted!');
        }

        const hist_promise: Promise<IHistoryModel> = History.create({patch: create_patch(requirement.data, <Schema.Types.Mixed> {})});

        requirement.data = <Schema.Types.Mixed> {};
        return Promise.all([requirement, hist_promise]);
    })
    .then((results) => {
        const requirement: IRequirementModel = results[0];
        const history: IHistoryModel = results[1];

        requirement.history!.push(history._id);
        requirement.save();

        return res.sendStatus(HttpStatus.ACCEPTED);

    })
    .catch(next);
});

// @TODO this needs to be refactored
router.post('/purge', (req: Request, res: Response, next: (...args: any[]) => void) => {
    const query = { 'deleted': true };
    const promise = Requirement.remove(query);

    promise.then((requirement) => {
        return res.json(requirement);
    })
    .catch(next);
});

// @TODO this needs to be refactored
router.post('/purge/:id', (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { id } = req.params;
    const query = { 'id': id, 'deleted': true };

    const promise = Requirement.findOneAndRemove(query);

    promise.then((requirement) => {
        return res.json(requirement);
    })
    .catch(next);
});

// Export the express.Router() instance to be used by server.ts
export const RequirementsController: Router = router;