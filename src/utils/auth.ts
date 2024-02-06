import { compare } from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import { connectToDb } from '../modules/mongo'
import User, { IUser } from '../modules/mongo/schema/User'

export const authOptions: NextAuthOptions = {
	session: {
		strategy: 'jwt',
	},
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!,
			authorization: {
				params: {
					scope: 'public_repo user:email',
				},
			},
		}),
		CredentialsProvider({
			name: 'Sign in',
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
					placeholder: 'example@example.com',
				},
				password: { label: 'Password', type: 'password' },
			},
			authorize: async credentials => {
				const { client } = await connectToDb()


				if (!client || !credentials?.email || !credentials.password) {
					return null
				}

				try {
					const user = await User.findOne({ email: credentials.email }).lean<IUser>()
					if (!user || !(await compare(credentials.password, user?.password || ''))) {
						return null
					}

					return {
						...user,
						id: user._id.toString() as string,
						image: user.image,
						email: user.email,
						name: user.fullName,
						rule: user.rule || '',
						tokenGithub: user.tokenGithub || '',
					}
				} catch (error) {
					console.log(error)
					return null
				}
			},
		}),
	],
	callbacks: {
		signIn: async ({ user, profile, account }) => {
			if (account?.provider === "github") {
				await connectToDb()
				const countUser = await User.findOne({ email: profile?.email?.toLowerCase(), type: 'github' }).lean() as IUser

				if (countUser) {
					// @ts-ignore
					user._id = String(countUser._id)
					return true
				}

				const newUser = await User.create({
					fullName: user?.name,
					email: user?.email?.toLowerCase(),
					type: 'github',
					image: user.image
				})

			}

			return true
		},
		session: ({ session, token, user }) => {
			return {
				...session,
				user: {
					...session.user,
					id: String(token.id),
					rule: token.rule,
					provider: token.provider,
				},
				tokenGithub: token.tokenGithub,
				provider: token.provider,
			}
		},
		jwt: async ({ token, user, account }) => {
			if (user?.id || token?.id) {
				if (user) {
					const u = user as any
					return {
						...token,
						id: u._id,
						rule: u.rule,
						...(account && account.provider === 'github'
							? {
								tokenGithub: account?.access_token,
								provider: account.provider,
							}
							: {}),
					}
				}

				return {
					...token,
					id: token.id,
					rule: token.rule,
					...(account && account.provider === 'github'
						? {
							tokenGithub: account?.access_token,
							provider: account.provider,
						}
						: {}),
				}
			}

			return {
				...token,
				id: user?.id ? user.id : token.id,
				rule: user?.rule ? user.rule : token.rule,
				...(account && account.provider === 'github'
					? {
						tokenGithub: account?.access_token,
						provider: account.provider,
					}
					: {}),
			}
		},
	},
	pages: {
		signIn: '/login',
		signOut: '/',

	},
}
