"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/*
interface IHistoryModel extends IHistoryItems, Document {

}
*/
exports.HistorySchema = new mongoose_1.Schema({
    history: [{ version: String, log: String, op: String, path: String, value: String }]
});
/*
@TODO - Need to add a function to re-construct the history from a set of diffs
*/
//Don't need the History model, just the schema for use in the Requirement model. 
//export const History: Model<IHistoryModel> = model<IHistoryModel>("History", HistorySchema);
