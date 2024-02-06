import { Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { IUser } from '../src/modules/mongo/schema/User'

declare module 'next-auth' {
	interface Session {
		id: string
		rule: string
		tokenGithub: string
		provider?: string
		user: {
			id: string
			rule: string
			tokenGithub: string
			provider?: string
		} & DefaultSession['user']
	}

	interface User {
		id: string
		rule: string
		tokenGithub: string
		provider?: string
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string
		rule: string
		tokenGithub: string
		provider?: string
	}
}
