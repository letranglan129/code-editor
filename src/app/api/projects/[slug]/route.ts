import { GridFSBucketReadStream } from 'mongodb'
import { connectToDb } from '../../../../modules/mongo'
import { NextRequest, NextResponse } from 'next/server'
import Project from '../../../../modules/mongo/schema/Project'
import { readStream } from '../../../../utils/stream'
import { authOptions } from '../../../../utils/auth'
import { getServerSession } from 'next-auth'
import { isPermissionCoOwnerDB, isPermissionEditDB, isPermissionViewDB } from '../../../../utils/permission'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
	const { bucket } = await connectToDb()
	const session = await getServerSession(authOptions)

	const project = await Project.findOne({ slug: params.slug })
		.populate('uuid', '_id fullName email image')
		.populate({
			path: 'permissions.uuid',
			select: '_id fullName email image',
		}).lean()

	// @ts-ignore
	if (session?.user?.id !== String(project?.uuid?._id) &&
		!isPermissionEditDB(project?.permissions, session?.user?.id) &&
		!isPermissionViewDB(project?.permissions, session?.user?.id) &&
		project?.visibility === 'private') {
		return NextResponse.json({}, { status: 401 })
	}

	const stream = bucket.openDownloadStreamByName(`${params.slug}.json`)
	const data = await readStream(stream)

	return Response.json({ ...project, files: data })
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
	const { bucket } = await connectToDb()
	const data = await req.json()
	const session = await getServerSession(authOptions)
	const projectCurrent = await Project.findOne({ slug: params.slug }).lean()

	if (session?.user?.id !== String(projectCurrent?.uuid) && !isPermissionCoOwnerDB(projectCurrent?.permissions, session?.user?.id)) {
		return NextResponse.json({}, { status: 401 })
	}

	if (data?.slug) {
		const checkSlug = await Project.countDocuments({ slug: data?.slug })
		if (checkSlug !== 0) {
			return Response.json({ error: 'Project URL already exists' }, { status: 400 })
		}

		const file = await bucket.find({ filename: `${params.slug}.json` }).toArray()
		if (file.length > 0) {
			await bucket.rename(file[0]._id, `${data?.slug}.json`)
		}
	}

	const project = await Project.findOneAndUpdate(
		{ slug: params.slug },
		{
			$set: {
				...data,
			},
		},
		{
			new: true,
		},
	).lean()

	return Response.json({ ...project })
}
