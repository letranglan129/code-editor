import { getServerSession } from 'next-auth'
import { connectToDb } from '../../../modules/mongo'
import Project from '../../../modules/mongo/schema/Project'
import { authOptions } from '../../../utils/auth'
import { NextRequest } from 'next/server'
import { DxDataGridFilter, DxDataGridSorting } from '../../../utils/types'
import { ObjectId } from 'mongodb'
import { isPermissionCoOwnerDB } from '../../../utils/permission'
const parseFilter = require('@/utils/devextremeMongo')

export async function GET(req: NextRequest) {
	await connectToDb()
	const session = await getServerSession(authOptions)
	const skip = req.nextUrl.searchParams.get('skip') ? Number(req.nextUrl.searchParams.get('skip')) : 0
	const take = req.nextUrl.searchParams.get('take') ? Number(req.nextUrl.searchParams.get('take')) : 10
	const sort: DxDataGridSorting[] = req.nextUrl.searchParams.get('sort')
		? JSON.parse(req.nextUrl.searchParams.get('sort') as string)
		: [{ selector: 'updatedAt', desc: true }]
	const filter = req.nextUrl.searchParams.get('filter')

	const projects = await Project.findByUuid(session?.user.id as string, {
		skip,
		take,
		sort,
		match: (filter ? parseFilter(filter as string)[0].$match : {}),
	})

	const totalCount = await Project.countDocuments({
		$and: [{ uuid: new ObjectId(session?.user.id) }, { isStarter: false }],
		...(filter ? parseFilter(filter as string)[0].$match : {}),
	})

	return Response.json({ data: projects, totalCount, sort, take, filter, skip })
}

export async function DELETE(req: NextRequest) {
	await connectToDb()
	const session = await getServerSession(authOptions)
	const key = (await req.formData()).get('key') as string

	const project = await Project.findBySlug(key)

	if (session?.user.id !== String(project?.uuid) && isPermissionCoOwnerDB(project?.permissions, session?.user?.id)) {
		return Response.json({}, { status: 401 })
	}

	await Project.deleteBySlug(session?.user.id, key)

	return Response.json({ project })
}

export async function PATCH(req: NextRequest) {
	await connectToDb()
	const session = await getServerSession(authOptions)
	const data = await req.json()

	const project = await Project.findBySlug(data.slug)

	if (session?.user.id !== String(project?.uuid) && isPermissionCoOwnerDB(project?.permissions, session?.user?.id)) {
		return Response.json({}, { status: 401 })
	}

	const newProject = await Project.findOneAndUpdate(
		{ uuid: session?.user.id, slug: data.slug },
		{ $set: { ...data } },
		{ new: true },
	)

	return Response.json({ project })
}
