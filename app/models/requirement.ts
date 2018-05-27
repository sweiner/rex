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
    id: { type: String, index: {unique: true, dropDups:true } },
    history: [HistorySchema],
    deleted: Boolean,
    data: Schema.Types.Mixed
});

RequirementSchema.pre('save', async function(): Promise<void> {
    let doc: IRequirementModel = this;

    if (doc.history === undefined) {
        return Promise.reject('SAVE FAILED: History is undefined for this object');
    }

    else {
        let prev_requirement: IRequirementModel | null = null;

        // If there is no record, it will be handled by update_history
        Requirement.findById(doc._id, (err,req) => {
            prev_requirement = req;
        });

        let new_history = await update_history(doc, prev_requirement);
        doc.history.push(new_history);
    }

});

RequirementSchema.pre('update', async function(): Promise<void> {
    let query:Query<any> = this;
});

export const Requirement: Model<IRequirementModel> = model<IRequirementModel>("Requirement", RequirementSchema);