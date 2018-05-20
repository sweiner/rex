// @TODO - add more robust processing on routes

import {Router, Request, Response} from 'express';
import {Requirement} from '../models/requirement';
import { NextHandleFunction } from 'connect';
import bodyParser from 'body-parser';

// Assign router to the express.Router() instance
const router: Router = Router();
const jsonParser: NextHandleFunction = bodyParser.json() 

// The / here corresponds to the route that the welcome controller
// is mounted on in the server.ts file
// In this case it's /welcome
router.get('/browse', (req: Request, res: Response) => {

    //Create an async request to obtain all of the requirements
    let promise = Requirement.find();

    promise.then((requirements) => {
        res.json(requirements);
    });

    promise.catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

router.get('/browse/:id', (req: Request, res: Response) => {
    // Extract the name from the request parameters
    let { id } = req.params;

    // Create an async request to find a particular requirement by reqid
    let promise = Requirement.findOne({id: id});

    promise.then((requirement) => {
        res.json(requirement);
    });

    promise.catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

router.post('/add/:id', jsonParser, (req: Request, res: Response) => {
    let { id } = req.params;
    if (!req.body) {
        return res.sendStatus(400)
    }

    // @TODO add validation on JSON
    let promise = Requirement.create({id: id, data: req.body.data, deleted: false});

    promise.then((requirement) => {
        res.json(requirement);
    });

    promise.catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

router.post('/edit/:id', jsonParser, (req: Request, res: Response) => {
    let { id } = req.params;
    let query = { 'id': id };

    if (!req.body) {
        return res.sendStatus(400)
    }

    let promise = Requirement.findOneAndUpdate(query, {data: req.body.data}, {new: true});

    promise.then((doc) => {
        return res.json(doc);
    });

    promise.catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

// Developmental API
router.post('/delete', (req: Request, res: Response) => {
    let query = {};
    let promise = Requirement.updateMany(query, {deleted: true});

    promise.then((doc) => {
        return res.json(doc);
    });

    promise.catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

router.post('/delete/:id', (req: Request, res: Response) => {
    let { id } = req.params;
    let query = { 'id': id };

    let promise = Requirement.findOneAndUpdate(query, {deleted: true}, {new: true});

    promise.then((doc) => {
        return res.json(doc);
    });

    promise.catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

router.post('/restore/:id', (req: Request, res: Response) => {
    let { id } = req.params;
    let query = { 'id': id };
  
    let promise = Requirement.findOneAndUpdate(query, {deleted: false}, {new: true});

    promise.then((doc) => {
        return res.json(doc);
    });

    promise.catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

router.post('/purge', (req: Request, res: Response) => {
    let query = { 'deleted': true };
    let promise = Requirement.remove(query);

    promise.then((doc) => {
        return res.json(doc);
    });

    promise.catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

router.post('/purge/:id', (req: Request, res: Response) => {
    let { id } = req.params;
    let query = { 'id': id, 'deleted': true };

    let promise = Requirement.findOneAndRemove(query);

    promise.then((doc) => {
        return res.json(doc);
    });

    promise.catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

// Export the express.Router() instance to be used by server.ts
export const RequirementsController: Router = router;