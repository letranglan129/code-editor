import { InferSchemaType, ObjectId, Schema, models, Model, model } from 'mongoose'

export interface IOrder {
	status: string
	amount: number
	pricing?: ObjectId
	paymentCode: string
	paymentLink: string
	paymentTime: string
}

export interface IUser {
	_id: ObjectId
	fullName: string
	password: string
	email: string
	image: string
	status: string
	rule: string
	bio: string
	location: string
	site: string
	type: string
	tokenGithub?: string
	pricingActive: ObjectId,
	orders: IOrder[]
}

interface UserModel extends Model<IUser> {
	findByEmail(emailQuery: string): IUser[]
}

const userSchema = new Schema<IUser, UserModel>(
	{
		fullName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
		},
		email: {
			type: String,
			required: true,
			lowercase: true,
			match: [/\S+@\S+\.\S+/, 'is invalid'],
		},
		image: {
			type: String,
			default: 'https://static.productionready.io/images/smiley-cyrus.jpg',
		},
		status: {
			type: String,
			default: 'active',
		},
		rule: {
			type: String,
			default: 'user',
		},
		bio: {
			type: String,
			default: '',
		},
		location: {
			type: String,
			default: '',
		},
		site: {
			type: String,
			default: '',
		},
		type: {
			type: String,
			default: 'credentials',
		},
	},
	{
		timestamps: true,
	},
)

userSchema.static('findByEmail', function (emailQuery: string) {
	return this.find({
		email: new RegExp(emailQuery, "i"),
	}).lean()
})

//@ts-ignore
const User = (models.user as UserModel) || model<IUser, UserModel>('user', userSchema)

export default User