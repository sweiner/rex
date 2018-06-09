// @TODO - add more robust processing on routes
import { NextHandleFunction } from 'connect';
import { Router, Request, Response } from 'express';
import { Requirement } from '../models/requirement';
import { History, update_history, IHistoryModel } from '../models/history';
import bodyParser from 'body-parser';

// Assign router to the express.Router() instance
const router: Router = Router();

// @TODO modify the global browse to be efficient
router.get('/browse', (req: Request, res: Response) => {

});

router.get('/browse/:id', (req: Request, res: Response) => {

});

// Export the express.Router() instance to be used by server.ts
export const HistoryController: Router = router;