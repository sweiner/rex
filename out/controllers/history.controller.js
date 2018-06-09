"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Assign router to the express.Router() instance
const router = express_1.Router();
// @TODO modify the global browse to be efficient
router.get('/browse', (req, res) => {
});
router.get('/browse/:id', (req, res) => {
});
// Export the express.Router() instance to be used by server.ts
exports.HistoryController = router;
