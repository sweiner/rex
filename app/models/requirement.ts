import { Document, Schema, Model, Query, model } from 'mongoose';
import { HistorySchema, IHistoryItem, update_history } from './history'

interface IRequirement {
    reqid?: string;
    data?: Schema.Types.Mixed;
    history?: [IHistoryItem];
    deleted?: boolean;
}

export interface IRequirementModel extends IRequirement, Document {

}

const RequirementSchema: Schema = new Schema({
    id: { type: String, index: true, unique: true },
    history: [HistorySchema],
    deleted: Boolean,
    data: Schema.Types.Mixed
});

export const Requirement: Model<IRequirementModel> = model<IRequirementModel>("Requirement", RequirementSchema);