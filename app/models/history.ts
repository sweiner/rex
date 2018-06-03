import { Document, Schema, Model, model } from 'mongoose';
import { Operation } from 'rfc6902/diff';
import * as rfc from 'rfc6902';

interface IHistory {
    log?: string;
    patch?: Operation[];
}

export interface IHistoryModel extends IHistory, Document {

}

export const HistorySchema: Schema = new Schema(
    { log: String, patch: [Schema.Types.Mixed] });

export function update_history(new_data: Schema.Types.Mixed, old_data: Schema.Types.Mixed):IHistory {
    let new_item: IHistory;

    new_item = { patch: rfc.createPatch(old_data, new_data) };
    return new_item
}

export const History: Model<IHistoryModel> = model<IHistoryModel>("History", HistorySchema);