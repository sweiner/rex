/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

import { Document, Schema, Model, model } from 'mongoose';
import { Operation } from 'rfc6902/diff';
import * as rfc from 'rfc6902';

interface IHistory {
    version?: number;
    log?: string;
    patch?: Operation[];
}

export interface IHistoryModel extends IHistory, Document {

}

export const HistorySchema: Schema = new Schema(
    { version: Number, log: String, patch: [Schema.Types.Mixed] });

export function create_patch(old_data: Schema.Types.Mixed, new_data: Schema.Types.Mixed): Operation[] | null {
    let new_item: Operation[];

    new_item = rfc.createPatch(new_data, old_data);
    if (new_item.length == 0) {
        return null;
    }
    return new_item;
}

export function apply_patch(data: Schema.Types.Mixed, patch: Operation[]): Schema.Types.Mixed {
    const patched: Schema.Types.Mixed = rfc.applyPatch(data, patch);
    return data;
}

export const History: Model<IHistoryModel> = model<IHistoryModel>('History', HistorySchema);