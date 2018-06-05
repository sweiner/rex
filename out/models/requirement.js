"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RequirementSchema = new mongoose_1.Schema({
    id: { type: String, index: true, unique: true },
    history: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'History' }],
    deleted: Boolean,
    data: {
        type: mongoose_1.Schema.Types.Mixed,
        validate: {
            validator: function (v) {
                return !(Object.keys(v).length === 0 && v.constructor === Object);
            },
            message: 'Requirement data is blank or missing from the request body'
        },
        required: [true, 'Requirement data is missing from the request body']
    }
});
exports.Requirement = mongoose_1.model("Requirement", RequirementSchema);
