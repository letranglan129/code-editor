// app/api/upload
import { connectToDb, fileExists } from '@/modules/mongo'
import { NextResponse } from 'next/server'
import { Readable } from 'stream'
import { createFile } from '../../../../../utils/stream'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../utils/auth'
import Project from '../../../../../modules/mongo/schema/Project'
import { isPermissionEditDB } from '../../../../../utils/permission'

export async function POST(req: Request, { params }: { params: { slug: string } }) {
	const { bucket } = await connectToDb()
	const session = await getServerSession(authOptions)
	const project = await Project.findBySlug(params.slug)

	if (session?.user?.id !== String(project?.uuid) && !isPermissionEditDB(project?.permissions, session?.user.id)) {
		return NextResponse.json({}, { status: 401 })
	}

	// get the form data
	const data = await req.json()
	const projectData = data.projectData

	const filename = params.slug + ".json"
	const existing = await fileExists(filename)

	if (existing) {
		const file = await bucket.find({ filename: filename }).toArray()

		if (file.length > 0) {
			await bucket.delete(file[0]._id)
		}
	}

	const uploadStream = bucket.openUploadStream(filename, { contentType: 'application/json' })
	const res = await createFile(uploadStream, Buffer.from(JSON.stringify(projectData), 'utf-8'))

	// return the response after all the entries have been processed.
	return NextResponse.json({ success: existing })
}
