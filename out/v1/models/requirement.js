"use strict";
/*
 * Copyright (c) 2018 ${author}
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
function simplify(doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    delete ret.history;
    return ret;
}
exports.simplify = simplify;
const RequirementSchema = new mongoose_1.Schema({
    name: { type: String, index: true, unique: true },
    history: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'History' }],
    data: { type: mongoose_1.Schema.Types.Mixed, default: {} }
}, { minimize: false });
RequirementSchema.set('toObject', { transform: simplify });
exports.Requirement = mongoose_1.model('Requirement', RequirementSchema);
