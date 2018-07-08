"use strict";
/*
 * Copyright (c) 2018 ${author}
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Validation Middleware
// Since user defined data is contained in the body of requirement
// requests, we need middleware to validate the data.
// Validate the fields do not contain '.' or '$' characters
// This is a limitation of MongoDB queries
// See https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names
function validateDataFields(data) {
    const reg = new RegExp('[\.$]');
    let result = true;
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (key.match(reg)) {
                throw new Error('Cannot use \'.\' or \'$\' characters in an object key (' + key + '). ' +
                    'This is a limitation of MongoDB. See https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names ');
            }
            else if (data[key] && typeof data[key] == 'object') {
                result = result && validateDataFields(data[key]);
            }
        }
    }
    return result;
}
function simplify(doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    delete ret.history;
    return ret;
}
exports.simplify = simplify;
const RequirementSchema = new mongoose_1.Schema({
    name: { type: String, index: true, unique: true },
    history: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'History', default: [] }],
    data: { type: mongoose_1.Schema.Types.Mixed, default: {}, validate: validateDataFields }
}, { minimize: false });
RequirementSchema.set('toObject', { transform: simplify });
exports.Requirement = mongoose_1.model('Requirement', RequirementSchema);
//# sourceMappingURL=requirement.js.map