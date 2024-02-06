import { getServerSession } from 'next-auth'
import { connectToDb } from '../../../../../modules/mongo'
import { authOptions } from '../../../../../utils/auth'
import Project from '../../../../../modules/mongo/schema/Project'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { isPermissionCoOwnerDB } from '../../../../../utils/permission'

export async function POST(req: Request, { params }: { params: { slug: string } }) {
    const { bucket } = await connectToDb()
    const session = await getServerSession(authOptions)
    const project = await Project.findBySlug(params.slug)

    const data = await req.json()

    if (session?.user?.id === String(project?.uuid) ||
        (project?.permissions && isPermissionCoOwnerDB(project?.permissions, session?.user?.id))) {
        const project = await Project.findOneAndUpdate({
            slug: params.slug
        }, {
            $addToSet: {
                permissions: {
                    uuid: new ObjectId(data.userId),
                    permissionName: data.permission
                }
            }
        }, {
            new: true
        }).populate('uuid', '_id fullName email image')
            .populate('permissions.uuid', '_id fullName email image').lean()

        return NextResponse.json({ project })
    }

    return NextResponse.json({}, { status: 401 })
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
    const { bucket } = await connectToDb()
    const session = await getServerSession(authOptions)
    const project = await Project.findBySlug(params.slug)

    const data = await req.json()

    if (session?.user?.id === String(project?.uuid) ||
        (project?.permissions && isPermissionCoOwnerDB(project?.permissions, session?.user?.id))) {

        if (data.type === 'edit') {
            await Project.findOneAndUpdate({
                slug: params.slug
            }, {
                $pull: {
                    permissions: {
                        uuid: new ObjectId(data.userId),
                    }
                }
            })

            const project = await Project.findOneAndUpdate({
                slug: params.slug
            }, {
                $addToSet: {
                    permissions: {
                        uuid: new ObjectId(data.userId),
                        permissionName: data.permission
                    }
                }
            }, {
                new: true
            }).populate('uuid', '_id fullName email image')
                .populate('permissions.uuid', '_id fullName email image').lean()

            return NextResponse.json({ project })
        } else {
            const project = await Project.findOneAndUpdate({
                slug: params.slug
            }, {
                $pull: {
                    permissions: {
                        uuid: new ObjectId(data.userId),
                    }
                }
            }, {
                new: true
            }).populate('uuid', '_id fullName email image')
                .populate('permissions.uuid', '_id fullName email image').lean()

            return NextResponse.json({ project })
        }
    }

    return NextResponse.json({}, { status: 401 })
}
