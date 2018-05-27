"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const history_1 = require("./history");
const RequirementSchema = new mongoose_1.Schema({
    id: { type: String, index: { unique: true, dropDups: true } },
    history: [history_1.HistorySchema],
    deleted: Boolean,
    data: mongoose_1.Schema.Types.Mixed
});
RequirementSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        let doc = this;
        if (doc.history === undefined) {
            return Promise.reject('SAVE FAILED: History is undefined for this object');
        }
        else {
            let prev_requirement = null;
            // If there is no record, it will be handled by update_history
            exports.Requirement.findById(doc._id, (err, req) => {
                prev_requirement = req;
            });
            let new_history = yield history_1.update_history(doc, prev_requirement);
            doc.history.push(new_history);
        }
    });
});
RequirementSchema.pre('update', function () {
    return __awaiter(this, void 0, void 0, function* () {
        let query = this;
    });
});
exports.Requirement = mongoose_1.model("Requirement", RequirementSchema);
