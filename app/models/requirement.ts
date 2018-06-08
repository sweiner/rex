import { Document, Schema, Model, Query, model } from 'mongoose';

interface IRequirement {
    reqid?: string;
    history?: [Schema.Types.ObjectId];
    deleted?: boolean;
    data?: Schema.Types.Mixed;
}

export interface IRequirementModel extends IRequirement, Document {

}

const RequirementSchema: Schema = new Schema({
    id: { type: String, index: true, unique: true },
    history: [{type: Schema.Types.ObjectId, ref:'History'}],
    deleted: Boolean,
    data: { type: Schema.Types.Mixed, default: {} }
}, {minimize: false});

export const Requirement: Model<IRequirementModel> = model<IRequirementModel>("Requirement", RequirementSchema);