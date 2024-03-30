'use client'

import axios from 'axios'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import lang from '../../../../locale/en'

type Repository = {
	owner: {
		login: string
		avatar_url: string
	}
	full_name: string
	updated_at: string
	clone_url: string
}

export default function Repositories() {
	const { data: session } = useSession()
	const [repos, setRepos] = useState<Repository[]>([])

	useEffect(() => {
		document.title = 'Repositories - Code Builder'
	}, [])

	useEffect(() => {
		const fetchRepos = async () => {
			if (!session?.tokenGithub) return
			const { data } = await axios.get<Repository[]>(
				'https://api.github.com/user/repos?sort=updated&direction=desc&affiliation=owner,collaborator',
				{
					headers: {
						Accept: 'application/vnd.github+json',
						Authorization: `Bearer ${session?.tokenGithub}`,
						'X-GitHub-Api-Version': '2022-11-28',
					},
				},
			)
			setRepos(data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()))
		}
		fetchRepos()
	}, [session?.tokenGithub])

	return (
		<div className="flex flex-col overflow-hidden p-2 sm:p-4 md:p-8 flex-1">
			<div className="flex items-end justify-between">
				<h2>{lang.myProjects}</h2>
				<Link href="" className="hover:underline text-12">
					{lang.showAll}
				</Link>
			</div>
			{!session?.user.provider && (
				<div className="text-14 text-center text-neutral-300 my-4">
					Only accounts logged in with github can use it
				</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
				{repos.map(repo => (
					<div key={repo.full_name} className="flex flex-col bg-grayNetural p-4">
						<h3 className="h-9 text-14 line-clamp-1">{repo.full_name}</h3>

						<div className="flex justify-between items-center">
							<p className="text-12 text-neutral-400">{moment(repo.updated_at).fromNow()}</p>
							<img src={repo.owner.avatar_url} className="w-6 h-6 rounded-full" alt="" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
