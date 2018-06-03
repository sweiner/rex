// @TODO - add more robust processing on routes
import { NextHandleFunction } from 'connect';
import { Router, Request, Response } from 'express';
import { Requirement } from '../models/requirement';
import { History, update_history, IHistoryModel } from '../models/history';
import bodyParser from 'body-parser';

// Assign router to the express.Router() instance
const router: Router = Router();
const jsonParser: NextHandleFunction = bodyParser.json() 


// @TODO modify the global browse to be efficient
router.get('/browse', (req: Request, res: Response) => {

    //Create an async request to obtain all of the requirements
    let promise = Requirement.find();

    promise.then((requirements) => {
        return res.json(requirements);
    })

    .catch((reason) => {
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
        return res.json(requirement);
    })

    .catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

router.post('/create/:id', jsonParser, (req: Request, res: Response) => {
    let { id } = req.params;
    if (!req.body) {
        return res.sendStatus(400)
    }

    // @TODO add validation on JSON
    let promise = Requirement.create({id: id, data: req.body.data, deleted: false});

    promise.then((requirement) => {
        return res.json(requirement);
    })
    
    .catch((reason) => {
        let err = {'error': reason};
        return res.json(err);
    });
});

router.post('/edit/:id', jsonParser, (req: Request, res: Response) => {
    let { id } = req.params;
    let query = { 'id': id };

    if (!req.body) {
        return res.sendStatus(400)
    }

    let req_promise = Requirement.findOne(query);

    // Create the history entry
    req_promise.then((doc) => {
        if(!doc) {
            throw new Error(id + 'does not exist!');
        }
        else if (doc.history === undefined || doc.data === undefined) {
            throw new Error('Error creating document history');
        }

        let hist_promise: Promise<IHistoryModel> = History.create(update_history(doc.data, req.body.data));
        doc.data = req.body.data;
        
        return Promise.all([doc,hist_promise]);
    })

    // Then save the new requirement
    .then((results) => {
        let doc = results[0];
        let hist = results[1];

        if(!doc) {
            throw new Error(id + 'does not exist!');
        }
        else if (doc.history === undefined || doc.data === undefined) {
            throw new Error('Error creating document history');
        }

        doc.history.push(hist._id);
        doc.save();
        return res.json(results[0]);
    })

    .catch((reason) => {
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
    })

    .catch((reason) => {
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
    })

    .catch((reason) => {
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
    })

    .catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

router.post('/purge', (req: Request, res: Response) => {
    let query = { 'deleted': true };
    let promise = Requirement.remove(query);

    promise.then((doc) => {
        return res.json(doc);
    })

    .catch((reason) => {
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
    })

    .catch((reason) => {
        let err = {'error': reason}
        return res.json(err);
    });
});

// Export the express.Router() instance to be used by server.ts
export const RequirementsController: Router = router;