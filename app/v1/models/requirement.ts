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

// Validation Middleware
// Since user defined data is contained in the body of requirement
// requests, we need middleware to validate the data.

// Validate the fields do not contain '.' or '$' characters
// This is a limitation of MongoDB queries
// See https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names

function validateDataFields (data: Schema.Types.Mixed): boolean {
    const reg = new RegExp('[\.$]');
    let result: boolean = true;

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (key.match(reg)) {
                throw new Error('Cannot use \'.\' or \'$\' characters in an object key (' + key + '). ' +
                                 'This is a limitation of MongoDB. See https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names ' +
                                 'for reference');
            }
            else if ( (<any>data)[key] && typeof(<any>data)[key] == 'object' ) {
                result = result && validateDataFields((<any>data)[key]);
            }
        }
    }
    return result;
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
    data: { type: Schema.Types.Mixed, default: {}, validate: validateDataFields }
}, {minimize: false});

RequirementSchema.set('toObject', { transform: simplify });

export const Requirement: Model<IRequirementModel> = model<IRequirementModel>('Requirement', RequirementSchema);