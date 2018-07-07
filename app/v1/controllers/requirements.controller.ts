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
import { HistoryController } from './history.controller';
import bodyParser from 'body-parser';
import * as HttpStatus from 'http-status-codes';

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
        return res.json(requirements);
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
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error ('Requirement does not exist!');
        }
        return res.json(requirement);
    })
    .catch(next);
});

router.put('/:name', jsonParser, (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { name } = req.params;
    const conditions = { 'name': name };
    const query: DocumentQuery<IRequirementModel | null, IRequirementModel> = Requirement.findOne(conditions);

    if (!req.body.data) {
        res.status(HttpStatus.BAD_REQUEST);
        throw new Error('Data field missing from requirement body.  See /api-docs for details');
    }
    else if (typeof(req.body.data) != 'object') {
        res.status(HttpStatus.BAD_REQUEST);
        throw new Error('Data field must contain an object.  See /api-docs for details');
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
                hist_promise = History.create({patch: patch, log: req.body.log});
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

router.delete('/:name', (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { name } = req.params;
    const conditions = { 'name': name };

    const query: DocumentQuery<IRequirementModel | null, IRequirementModel> = Requirement.findOne(conditions);
    const req_promise: Promise<IRequirementModel | null> = query.exec();

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

        const hist_promise: Promise<IHistoryModel> = History.create({patch: create_patch(requirement.data, <Schema.Types.Mixed> {})});

        requirement.data = <Schema.Types.Mixed> {};
        return Promise.all([requirement, hist_promise]);
    })
    .then((results) => {
        const requirement: IRequirementModel = results[0];
        const history: IHistoryModel = results[1];

        requirement.history!.push(history._id);
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
export const RequirementsController: Router = router;