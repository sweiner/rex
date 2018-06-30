"use strict";
/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../models/user");
const router = express_1.Router();
router.get("/", (req, res) => {
    res.send("Hello");
});
router.post("/:name", (req, res) => {
    const { name } = req.params;
    user_1.User.findOne({ firstName: name }, (err, user) => {
        if (err) {
            res.send("Error");
        }
        if (user == null) {
            const promise = user_1.User.create({ firstName: name });
            promise.then((user) => {
                res.send(JSON.stringify(user));
            });
        }
        else {
            res.send(JSON.stringify(user));
        }
    });
});
// Export the express.Router() instance to be used by server.ts
exports.UsersController = router;
