/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

import { Router, Request, Response } from 'express';
import { NextHandleFunction } from 'connect';
import { Requirement, IRequirementModel } from '../models/requirement';
import { History, IHistoryModel, applyPatch } from '../models/history';
import bodyParser from 'body-parser';
import * as HttpStatus from 'http-status-codes';
import HttpError from 'http-errors';

// Assign router to the express.Router() instance
const router: Router = Router();
const jsonParser: NextHandleFunction = bodyParser.json();


// Display all history for a given requirement
router.get('/:name', (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { name }: { name: string } = req.params;
    const conditions = { 'name': name };

    const query = Requirement.findOne(conditions);
    query.exec();

    query.then((requirement) => {
        if (requirement === null) {
            throw HttpError(HttpStatus.BAD_REQUEST, name + ' does not exist!');
        }
        return requirement;
    })
    .then ((requirement) => {
        const populated = requirement.populate({path: 'history', model: 'History', select: 'version log -_id' });
        return populated.execPopulate();
    })
    .then ((requirement) => {
        res.json(requirement.history);
    })
    .catch(next);
});

// Display the numbered version
router.get('/:name/:version', (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { name, version }: {name: string, version: number} = req.params;
    const conditions = { 'name': name };

    const query = Requirement.findOne(conditions).populate({path: 'history', model: 'History', select: 'version patch log -_id' }).exec();

    query.then((requirement) => {
        if (!requirement) {
            throw HttpError(HttpStatus.BAD_REQUEST, 'Requirement does not exist!');
        }
        else if (version >= requirement.history!.length) {
            throw HttpError(HttpStatus.BAD_REQUEST, 'Version ' + version.toString() + ' of ' + name + ' does not exist!');
        }

        const reconstructed_data: IRequirementModel = requirement;
        for ( let i = (requirement.history!.length - 1); i > version; i--) {
            reconstructed_data.data = applyPatch(reconstructed_data.data!, (requirement.history![i] as any).patch);
        }

        const reconstructed_data_object = reconstructed_data.toObject();
        res.json(reconstructed_data_object);
    })
    .catch(next);
});

// Update a log message
router.put('/:name/:version/log', jsonParser, (req: Request, res: Response, next: (...args: any[]) => void) => {
    const { name, version }: {name: string, version: number} = req.params;
    const conditions = { 'name': name };

    if (!req.body.log) {
        throw HttpError(HttpStatus.BAD_REQUEST, 'Log field missing from body');
    }

    const query = Requirement.findOne(conditions).exec();

    query.then((requirement) => {
        if (!requirement) {
            throw HttpError (HttpStatus.BAD_REQUEST, name + ' does not exist!');
        }
        else if (version >= requirement.history!.length) {
            throw HttpError(HttpStatus.BAD_REQUEST, 'Version ' + version.toString() + ' of ' + name + ' does not exist!');
        }

        const hist_promise: Promise<IHistoryModel | null> = History.findById(requirement.history![version]).exec();
        return hist_promise;
    })
    .then((history) => {
        history!.log = req.body.log;
        history!.save();
        res.sendStatus(HttpStatus.OK);
    })
    .catch(next);
});

// Export the express.Router() instance to be used by server.ts
export const HistoryController: Router = router;