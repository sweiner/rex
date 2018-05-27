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
exports.HistorySchema = new mongoose_1.Schema({
    log: String,
    patch: [mongoose_1.Schema.Types.Mixed]
}, {
    _id: false, id: false
});
function update_history(curr, prev) {
    let new_item;
    if (prev === null) {
        new_item = { patch: rfc.createPatch(curr.get('data'), []) };
    }
    else {
        new_item = { patch: rfc.createPatch(curr.get('data'), prev.get('data')) };
    }
    return Promise.resolve(new_item);
}
exports.update_history = update_history;
//Don't need the History model, just the schema for use in the Requirement model. 
//export const History: Model<IHistoryModel> = model<IHistoryModel>("History", HistorySchema);
