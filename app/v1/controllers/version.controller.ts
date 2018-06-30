/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

/* app/controllers/welcome.controller.ts */

// Import only what we need from express
import { Router } from "express";
import { RequirementsController, HistoryController, WelcomeController } from ".";
import * as swagger from "swagger-ui-express";
import * as api_doc from "../static/docs/api.json";

// Assign router to the express.Router() instance
const router: Router = Router();

// Attach controllers to the application
router.use("/", WelcomeController);
router.use("/api-docs", swagger.serve, swagger.setup(api_doc));
router.use("/requirements", RequirementsController);
router.use("/history", HistoryController);

// Export the express.Router() instance to be used by server.ts
export const Version1Controller: Router = router;