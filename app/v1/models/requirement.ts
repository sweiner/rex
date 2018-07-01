/*
 * Copyright (c) 2018 ${author}
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

import { Document, Schema, Model, DocumentToObjectOptions, model } from 'mongoose';

interface IRequirement {
    name?: string;
    history?: [Schema.Types.ObjectId];
    data?: Schema.Types.Mixed;
}

export interface IRequirementModel extends IRequirement, Document {

}

export function simplify(doc: Document, ret: any, options: DocumentToObjectOptions): any {
    delete ret._id;
    delete ret.__v;
    delete ret.history;
    return ret;
}

const RequirementSchema: Schema = new Schema({
    name: { type: String, index: true, unique: true },
    history: [{type: Schema.Types.ObjectId, ref: 'History'}],
    data: { type: Schema.Types.Mixed, default: {} }
}, {minimize: false});

RequirementSchema.set('toObject', { transform: simplify });

export const Requirement: Model<IRequirementModel> = model<IRequirementModel>('Requirement', RequirementSchema);