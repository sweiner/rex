"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RequirementSchema = new mongoose_1.Schema({
    id: { type: String, index: true, unique: true },
    history: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'History' }],
    deleted: Boolean,
    data: { type: mongoose_1.Schema.Types.Mixed, default: {} }
}, { minimize: false });
exports.Requirement = mongoose_1.model("Requirement", RequirementSchema);
