"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const rfc = __importStar(require("rfc6902"));
exports.HistorySchema = new mongoose_1.Schema({ log: String, patch: [mongoose_1.Schema.Types.Mixed] });
function update_history(new_data, old_data) {
    let new_item;
    new_item = { patch: rfc.createPatch(old_data, new_data) };
    return new_item;
}
exports.update_history = update_history;
exports.History = mongoose_1.model("History", exports.HistorySchema);
