import { ObjectId } from 'mongodb'
import { FilterQuery, InferSchemaType, Model, Schema, SchemaDefinitionProperty, model, models } from 'mongoose'
import { connectToDb } from '..'
import { convertSortQuery } from '../../../utils/dxSort'
import { createFile, readStream } from '../../../utils/stream'
import { createProjectSlug } from '../../../utils/strings'
import { DxDataGridSorting } from '../../../utils/types'

export interface IProject {
	parent_id?: string
	description: string
	forks_count?: number
	title: string
	type: string[]
	visibility?: string
	views_count?: number
	isStarter: boolean
	level: number
	slug: string
	uuid: SchemaDefinitionProperty<ObjectId, IProject> | null
	cmdStartup: string
	core: string
	icon: string
	createdAt?: Date
	updatedAt?: Date
	isDeploy?: boolean
	publishUrl?: string
	permissions?: {
		uuid: ObjectId,
		permissionName: "editor" | "viewer" | "co-owner",
	}[]
}

interface ProjectModel extends Model<IProject> {
	getProjectStarters(): IProject[]
	findBySlug(slug: string): IProject
	cloneBySlug(userId: string, slug: string): IProject
	createStarterProject(file: string, data: InferSchemaType<typeof projectSchema>): IProject
	findByUuid(
		uuid: string,
		{
			skip,
			take,
			sort,
			match,
		}: { match: FilterQuery<any>; skip: number; take: number; sort: DxDataGridSorting[] },
	): Pick<
		IProject,
		'title' | 'forks_count' | 'views_count' | 'slug' | 'updatedAt' | 'core' | 'icon' | 'description' | 'level'
	>[]

	deleteBySlug(uuid: string, slug: string): IProject
}

const projectSchema = new Schema<IProject, ProjectModel>(
	{
		parent_id: {
			type: String,
			default: '',
		},
		description: {
			type: String,
			default: '',
		},
		forks_count: {
			type: Number,
			default: 0,
		},
		title: {
			type: String,
			required: true,
		},
		type: {
			type: [String],
			required: true,
		},
		visibility: {
			type: String,
			default: 'public',
		},
		views_count: {
			type: Number,
			default: 0,
		},
		isStarter: {
			type: Boolean,
			default: false,
		},
		level: {
			type: Number,
			default: 0,
		},
		slug: {
			type: String,
			required: true,
		},
		uuid: {
			type: ObjectId,
			default: null,
			ref: 'user'
		},
		cmdStartup: {
			type: String,
			required: true,
		},
		core: {
			type: String,
			required: true,
		},
		icon: {
			type: String,
			required: true,
		},
		isDeploy: {
			type: Boolean,
			default: false,
		},
		publishUrl: {
			type: String,
		},
		permissions: {
			type: [
				{
					uuid: {
						type: ObjectId,
						ref: 'user',
					},
					permissionName: {
						type: String,
						enum: ['editor', 'viewer', 'co-owner'],
						default: 'viewer',
					},
				}
			],
			default: [],
			_id: false,
		}
	},
	{
		timestamps: true,
	},
)

projectSchema.static('getProjectStarters', function () {
	return this.find({ isStarter: true }, 'title slug core type icon').lean()
})

projectSchema.static('findBySlug', function (slug: string) {
	return this.findOne({ slug }).select({ _id: 0 }).lean()
})

projectSchema.static('cloneBySlug', async function (userId: string, preSlug: string) {
	const { bucket } = await connectToDb()

	const stream = bucket.openDownloadStreamByName(`${preSlug}.json`)
	const project = (await this.findBySlug(preSlug)) as IProject
	const slug = createProjectSlug(preSlug)

	const data = (await readStream(stream)) as string

	const uploadStream = bucket.openUploadStream(`${slug}.json`, { contentType: 'application/json' })
	const res = await createFile(uploadStream, Buffer.from(JSON.stringify(data), 'utf-8'))

	return this.create({
		...project,
		isStarter: false,
		level: 0,
		isDeploy: project.isDeploy,
		slug: slug,
		uuid: userId ? new ObjectId(userId) : null,
		updatedAt: new Date(),
		createdAt: new Date(),
		publishUrl: null,
		permissions: []
	})
})

projectSchema.static(
	'createStarterProject',
	async function (file: string, data: InferSchemaType<typeof projectSchema>) {
		const { bucket } = await connectToDb()

		const uploadStream = bucket.openUploadStream(`${data.slug}.json`, { contentType: 'application/json' })
		uploadStream.write(Buffer.from(file, 'utf-8'))
		uploadStream.end()

		return this.create(data)
	},
)

projectSchema.static(
	'findByUuid',
	function (
		uuid: string,
		{
			match,
			skip,
			take,
			sort,
		}: { match: FilterQuery<any>; skip: number; take: number; sort: DxDataGridSorting[] },
	) {
		return this.aggregate([
			{
				$match: {
					$and: [{
						$or: [
							{ uuid: new ObjectId(uuid) },
							{ "permissions.uuid": new ObjectId(uuid) }
						]
					}, { isStarter: false }],
					...match,
				},
			},
			{ $skip: skip },
			{ $limit: take },
			{ $sort: convertSortQuery(sort) },
			{
				$lookup: {
					from: 'users',
					localField: 'uuid',
					foreignField: '_id',
					as: 'owner'
				}
			},
			{
				$project: {
					title: 1,
					forks_count: 1,
					views_count: 1,
					slug: 1,
					updatedAt: 1,
					core: 1,
					icon: 1,
					description: 1,
					level: 1,
					publishUrl: 1,
					uuid: 1,
					fullName: { $arrayElemAt: ["$owner.fullName", 0] },
					email: { $arrayElemAt: ["$owner.email", 0] }
				}
			},
		])
	},
)

projectSchema.static('deleteBySlug', async function (uuid: string, slug: string) {
	const { bucket } = await connectToDb()

	const file = await bucket.find({ filename: `${slug}.json` }).toArray()

	if (file.length > 0) {
		await bucket.delete(file[0]._id)
	}

	return this.findOneAndDelete({ slug, uuid })
})

const Project = (models.project as ProjectModel) || model<IProject, ProjectModel>('project', projectSchema)

export default Project
