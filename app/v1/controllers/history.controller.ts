/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

import { Router, Request, Response } from "express";

// Assign router to the express.Router() instance
const router: Router = Router();

// Display all history for a given requirement
router.get("/:id", (req: Request, res: Response) => {

});

// Export the express.Router() instance to be used by server.ts
export const HistoryController: Router = router;