"use strict";
/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/* app/controllers/welcome.controller.ts */
// Import only what we need from express
const express_1 = require("express");
// Assign router to the express.Router() instance
const router = express_1.Router();
// The / here corresponds to the route that the welcome controller
// is mounted on in the server.ts file
// In this case it"s /welcome
router.get("/", (req, res) => {
    // Reply with a hello world when no name param is provided
    res.redirect("/api");
});
// Export the express.Router() instance to be used by server.ts
exports.WelcomeController = router;
