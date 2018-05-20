"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const history_1 = require("./history");
const RequirementSchema = new mongoose_1.Schema({
    id: { type: String, index: { unique: true, dropDups: true } },
    data: mongoose_1.Schema.Types.Mixed,
    history: history_1.HistorySchema,
    deleted: Boolean
});
exports.Requirement = mongoose_1.model("Requirement", RequirementSchema);
