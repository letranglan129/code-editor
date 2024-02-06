import Project, { IProject } from '@/modules/mongo/schema/Project'
import { authOptions } from '@/utils/auth'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { connectToDb } from '../../../../../modules/mongo'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
	await connectToDb()
	const session = await getServerSession(authOptions)

	let newProject: IProject | null = await Project.cloneBySlug(session?.user.id as string, params.slug)

	if (!newProject) {
		return Response.json(null, { status: 500 })
	}

	newProject = await Project.findOne({ slug: newProject.slug }).populate('uuid', '_id fullName email image').lean()

	return Response.json(newProject)
}
