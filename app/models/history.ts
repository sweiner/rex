import { Document, Schema, Model, model } from 'mongoose';
import { Operation } from 'rfc6902/diff';
import { IRequirementModel } from './requirement';
import * as rfc from 'rfc6902';

export interface IHistoryItem {
    log?: string;
    patch?: Operation[];
}

interface IHistoryInfo {
    current_doc?: Document;
}

export const HistorySchema: Schema = new Schema(
    {
        log: String,
        patch: [Schema.Types.Mixed] 
    }, 
    {
        _id:false,id:false
    });

export function update_history(new_data: Schema.Types.Mixed, old_data: Schema.Types.Mixed):IHistoryItem {
    let new_item: IHistoryItem;

    new_item = { patch: rfc.createPatch(old_data, new_data) };
    return new_item
}

//Don't need the History model, just the schema for use in the Requirement model. 
//export const History: Model<IHistoryModel> = model<IHistoryModel>("History", HistorySchema);