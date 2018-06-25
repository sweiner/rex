// @TODO - add more robust processing on routes
import { NextHandleFunction } from 'connect';
import { Router, Request, Response } from 'express';
import { Requirement, IRequirementModel } from '../models/requirement';
import { History, create_patch, IHistoryModel } from '../models/history';
import bodyParser from 'body-parser';
import { Schema, Mongoose } from 'mongoose';

// Assign router to the express.Router() instance
const router: Router = Router();
const jsonParser: NextHandleFunction = bodyParser.json(); 

// @TODO modify the global browse to be efficient
router.get('/browse', (req: Request, res: Response, next: (...args:any[]) => void) => {
    //Create an async request to obtain all of the requirements
    let promise = Requirement.find();

    promise.then((requirements) => {

        let simplified = requirements.map(requirement => {
            return {"id":requirement.id, "data": requirement.data};
        });

        return res.json(simplified);
    })
    .catch(next);
});

router.get('/browse/:id', (req: Request, res: Response, next: (...args:any[]) => void) => {
    // Extract the name from the request parameters
    let { id } = req.params;

    // Create an async request to find a particular requirement by reqid
    let promise = Requirement.findOne({id: id});

    promise.then((requirement) => {
        return res.json(requirement);
    })
    .catch(next);
});

router.post('/add/:id', jsonParser, (req: Request, res: Response, next: (...args:any[]) => void) => {
    let { id } = req.params;
 
    if (req.body.data === undefined) {
        res.status(400);
        throw new Error("'data' field in the Requirement body is undefined!");
    }
    
    let req_promise: Promise<IRequirementModel> = Requirement.create({id: id, data: req.body.data, deleted: false});

    req_promise.then((requirement) => {
        //Create a new history item 
        if(!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }

        let hist_promise: Promise<IHistoryModel> = History.create({patch: {}, log: req.body.log});
        return Promise.all([requirement,hist_promise]);
    })
    .then((results) => {
        let requirement:IRequirementModel = results[0];
        let history:IHistoryModel = results[1];

        if(!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }

        requirement.history.push(history._id);
        requirement.save();

        return res.json(requirement);
    })
    .catch(next);
});

router.post('/edit/:id', jsonParser, (req: Request, res: Response, next: (...args:any[]) => void) => {
    let { id } = req.params;
    let query = { 'id': id };

    let req_promise = Requirement.findOne(query);

    // Create the history entry
    req_promise.then((requirement) => {
        if(!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }

        //Create a new history item
        let hist_promise: Promise<IHistoryModel> = History.create({patch: create_patch(requirement.data, req.body.data),log:req.body.log});
        requirement.data = req.body.data;
        
        return Promise.all([requirement,hist_promise]);
    })

    // Then save the new requirement
    .then((results) => {
        let requirement = results[0];
        let hist = results[1];

        if(!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }

        requirement.history.push(hist._id);
        requirement.save();
        return res.json(requirement);
    })
    .catch(next);
});

// Developmental API
router.post('/delete', (req: Request, res: Response, next: (...args:any[]) => void) => {
    let query = {};
    let promise = Requirement.updateMany(query, {deleted: true});

    promise.then((requirements) => {
        return res.json(requirements);
    })
    .catch(next);
});

router.post('/delete/:id', (req: Request, res: Response, next: (...args:any[]) => void) => {
    let { id } = req.params;
    let query = { 'id': id };

    let req_promise = Requirement.findOne(query);

    req_promise.then((requirement) => {
        if(!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }
        else if (Object.keys(requirement.data).length === 0 && requirement.data.constructor === Object) {
            throw new Error('Requirement has already been deleted!');
        }

        let hist_promise: Promise<IHistoryModel> = History.create({patch: create_patch(requirement.data,<Schema.Types.Mixed> {})});      
        
        requirement.data = <Schema.Types.Mixed> {};
        return Promise.all([requirement,hist_promise]); 
    })
    .then((results) =>{
        let requirement:IRequirementModel = results[0];
        let history:IHistoryModel = results[1];

        if(!requirement) {
            throw new Error(id + 'does not exist!');
        }
        else if (requirement.history === undefined || requirement.data === undefined) {
            throw new Error('Error creating document history');
        }

        requirement.history.push(history._id);
        requirement.save();
        return res.json(requirement);

    })
    .catch(next);
});

router.post('/restore/:id', (req: Request, res: Response, next: (...args:any[]) => void) => {
    let { id } = req.params;
    let query = { 'id': id };
  
    let promise = Requirement.findOneAndUpdate(query, {deleted: false}, {new: true});

    promise.then((requirement) => {
        return res.json(requirement);
    })
    .catch(next);
});

router.post('/purge', (req: Request, res: Response, next: (...args:any[]) => void) => {
    let query = { 'deleted': true };
    let promise = Requirement.remove(query);

    promise.then((requirement) => {
        return res.json(requirement);
    })
    .catch(next);
});

router.post('/purge/:id', (req: Request, res: Response, next: (...args:any[]) => void) => {
    let { id } = req.params;
    let query = { 'id': id, 'deleted': true };

    let promise = Requirement.findOneAndRemove(query);

    promise.then((requirement) => {
        return res.json(requirement);
    })
    .catch(next);
});

// Export the express.Router() instance to be used by server.ts
export const RequirementsController: Router = router;