/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */


import { Router, Request, Response } from "express";
import { User } from "../models/user";

const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
    res.send("Hello");
});

router.post("/:name", (req: Request, res: Response) => {
    const { name } = req.params;
    User.findOne({ firstName: name }, (err, user) => {
        if (err) {
            res.send("Error");
        }
        if (user == null) {
            const promise = User.create({firstName: name});
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
export const UsersController: Router = router;