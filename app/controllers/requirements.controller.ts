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
router.get('/', (req: Request, res: Response) => {

    //Create an async request to obtain all of the requirements
    let promise = Requirement.find();
    promise.then( (requirements) => {
        res.json(requirements);
    });
});

router.get('/:id', (req: Request, res: Response) => {
    // Extract the name from the request parameters
    let { id } = req.params;

    // Create an async request to find a particular requirement by reqid
    let promise = Requirement.findOne({id: id});
    promise.then( (requirement) => {
        res.json(requirement);
    });
});

router.post('/', jsonParser, (req: Request, res: Response) => {

    if (!req.body) {
        return res.sendStatus(400)
    }

    Requirement.findOne({id: req.body.id}, (err, requirement) => {
        if (err || requirement) {
            return res.sendStatus(400);
        }

        // @TODO add validation on JSON
        let promise = Requirement.create({id: req.body.id, data: req.body.data});
        promise.then((requirement) => {
            res.json(requirement);
        });
    });
});

// Export the express.Router() instance to be used by server.ts
export const RequirementsController: Router = router;