import { NextRequest } from 'next/server'
import { connectToDb } from '../../../modules/mongo'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../utils/auth'
import User from '../../../modules/mongo/schema/User'

export async function GET(req: NextRequest) {
    await connectToDb()
    const session = await getServerSession(authOptions)

    const emailQuery = req.nextUrl.searchParams.get('email') ? req.nextUrl.searchParams.get('email')! : ''

    const users = await User.findByEmail(emailQuery)

    return Response.json(users)
}