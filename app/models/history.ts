import { Document, Schema, Model, model } from 'mongoose';

interface IHistoryItem {
    version?: number;
    log?: string;
    op?: string;
    path?: string;
    value?: string;
}

export interface IHistoryItems extends Array<IHistoryItem>{}

/*
interface IHistoryModel extends IHistoryItems, Document {

}
*/

export const HistorySchema: Schema = new Schema({
    history: [{version: String, log: String, op: String, path: String, value: String}]
});

/*
@TODO - Need to add a function to re-construct the history from a set of diffs
*/

//Don't need the History model, just the schema for use in the Requirement model. 
//export const History: Model<IHistoryModel> = model<IHistoryModel>("History", HistorySchema);