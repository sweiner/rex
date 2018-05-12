import { Document, Schema, Model, model} from "mongoose";

interface IUser {
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface IUserModel extends IUser, Document {
  fullName(): string;
}

const UserSchema: Schema = new Schema({
  createdAt: Date,
  email: String,
  firstName: String,
  lastName: String
});

UserSchema.methods.fullName = function(): string {
  return (this.firstName.trim() + " " + this.lastName.trim());
};

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);