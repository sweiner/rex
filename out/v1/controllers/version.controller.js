"use strict";
/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* app/controllers/welcome.controller.ts */
// Import only what we need from express
const express_1 = require("express");
const _1 = require(".");
const swagger = __importStar(require("swagger-ui-express"));
const api_doc = __importStar(require("../static/docs/api.json"));
// Assign router to the express.Router() instance
const router = express_1.Router();
// Attach controllers to the application
router.use("/", _1.WelcomeController);
router.use("/api-docs", swagger.serve, swagger.setup(api_doc));
router.use("/requirements", _1.RequirementsController);
router.use("/history", _1.HistoryController);
// Export the express.Router() instance to be used by server.ts
exports.Version1Controller = router;
