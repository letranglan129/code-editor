import Project from '@/modules/mongo/schema/Project'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDb } from '../../../../../modules/mongo'
import { authOptions } from '../../../../../utils/auth'
import { createProjectSlug } from '../../../../../utils/strings'

export async function GET(req: NextRequest) {
	await connectToDb()
	const project = await Project.getProjectStarters()

	return Response.json(project)
}

export async function POST(req: NextRequest) {
	await connectToDb()
	const session = await getServerSession(authOptions)
	const data = await req.json()

	const slug = createProjectSlug(data.slug as string, false)

	const newStarterProject = await Project.createStarterProject(JSON.stringify(data.file), {
		title: data.title as string,
		description: data.description as string,
		type: data.type as string[],
		core: data.core as string,
		level: Number(data.level),
		slug,
		cmdStartup: data.cmdStartup as string,
		icon: data.icon as string,
		uuid: session?.user.id ? new ObjectId(session?.user.id as string) : null,
		isStarter: true,
	})

	return NextResponse.json({ success: true, newStarterProject })
}
