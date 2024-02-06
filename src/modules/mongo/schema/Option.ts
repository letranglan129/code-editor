import mongoose, { InferSchemaType, ObjectId, Schema } from 'mongoose'

export interface IOption {
	types: string[]
	cores: string[]
	icons: string[]
}

interface OptionModel extends mongoose.Model<IOption> {}

const optionSchema = new Schema<IOption, OptionModel>(
	{
		types: {
			type: [String],
			required: true,
		},
		cores: {
			type: [String],
			required: true,
		},
		icons: {
			type: [String],
			required: true,
		},
	},
	{
		timestamps: true,
	},
)

const Option = mongoose.models.option || mongoose.model('option', optionSchema)

export type OptionType = InferSchemaType<typeof optionSchema>
export default Option
