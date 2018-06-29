"use strict";
/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Assign router to the express.Router() instance
const router = express_1.Router();
// Display all history for a given requirement
router.get('/:id', (req, res) => {
});
// Export the express.Router() instance to be used by server.ts
exports.HistoryController = router;
