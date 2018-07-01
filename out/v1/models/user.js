"use strict";
/*
 * Copyright (c) 2018 ${author}
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    createdAt: Date,
    email: String,
    firstName: String,
    lastName: String
});
UserSchema.methods.fullName = function () {
    return (this.firstName.trim() + ' ' + this.lastName.trim());
};
exports.User = mongoose_1.model('User', UserSchema);
