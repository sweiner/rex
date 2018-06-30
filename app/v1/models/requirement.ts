/*
 * Copyright (c) 2018 ${author}
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */

import { Document, Schema, Model, Query, model } from "mongoose";

interface IRequirement {
    reqid?: string;
    history?: [Schema.Types.ObjectId];
    data?: Schema.Types.Mixed;
}

export interface IRequirementModel extends IRequirement, Document {

}

export function simplify_requirement(requirement: IRequirementModel): Object {
    return {"id": requirement.id, "data": requirement.data};
}

const RequirementSchema: Schema = new Schema({
    id: { type: String, index: true, unique: true },
    history: [{type: Schema.Types.ObjectId, ref: "History"}],
    data: { type: Schema.Types.Mixed, default: {} }
}, {minimize: false});

export const Requirement: Model<IRequirementModel> = model<IRequirementModel>("Requirement", RequirementSchema);