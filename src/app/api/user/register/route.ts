import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { connectToDb } from '../../../../modules/mongo'
import User from '../../../../modules/mongo/schema/User'

export async function POST(req: Request) {
	try {
		connectToDb()
		const { fullName, email, password } = await req.json()

		const countUser = await User.findOne({ email: email.toLowerCase() })

		if (!countUser) {
			return NextResponse.json('Exist customer')
		}

		const hashed_password = await hash(password, 12)

		const user = await User.create({
			fullName,
			email: email.toLowerCase(),
			password: hashed_password,
		})

		return NextResponse.json({
			user: {
				fullname: user.fullName,
				email: user.email,
			},
		})
	} catch (error: any) {
		return new NextResponse(
			JSON.stringify({
				status: 'error',
				message: error.message,
			}),
			{ status: 500 },
		)
	}
}
