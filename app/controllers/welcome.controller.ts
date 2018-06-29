/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

/* app/controllers/welcome.controller.ts */

// Import only what we need from express
import { Router, Request, Response } from "express";

// Assign router to the express.Router() instance
const router: Router = Router();

// The / here corresponds to the route that the welcome controller
// is mounted on in the server.ts file
// In this case it"s /welcome
router.get("/", (req: Request, res: Response) => {
    // Reply with a hello world when no name param is provided
    res.redirect("/api");
});

// Export the express.Router() instance to be used by server.ts
export const WelcomeController: Router = router;