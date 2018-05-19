import { Document, Schema, Model, model } from 'mongoose';
import { HistorySchema, IHistoryItems } from './history'

interface IRequirement {
    reqid?: string;
    data?: Schema.Types.Mixed;
    history?: IHistoryItems;
}

interface IRequirementModel extends IRequirement, Document {

}

const RequirementSchema: Schema = new Schema({
    id: { type: String, index: {unique: true, dropDups:true } },
    data: Schema.Types.Mixed,
    history: HistorySchema
});

export const Requirement: Model<IRequirementModel> = model<IRequirementModel>("Requirement", RequirementSchema);