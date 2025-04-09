import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
	classType: string;
	fileName: string;
	displayName: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const ContractSchema: Schema = new Schema(
	{
		classType: {
			type: String,
			required: true,
			trim: true,
		},
		fileName: {
			type: String,
			required: true,
			trim: true,
		},
		displayName: {
			type: String,
			required: true,
			trim: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Contract || mongoose.model<IContract>("Contract", ContractSchema);
