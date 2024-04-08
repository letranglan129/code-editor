'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Scrollbar from '../../../../components/Scrollbar'
import { useModalStore } from '../../../../store/modalStore'

import Link from 'next/link'
import { useEffect } from 'react'
import { FaPlus } from 'react-icons/fa'
import { FaArrowDownLong } from 'react-icons/fa6'
import ProjectStarter from '../../../../components/ProjectStarter'
import isAuth from '../../../../components/isAuth'
import lang from '../../../../locale/en'
const ProjectsTable = dynamic(() => import('../../../../components/Table/ProjectsTable'), {
	ssr: false,
})

export default isAuth(function Dashboard() {
	const modelStore = useModalStore()
	
	useEffect(() => {
		document.title = 'Dashboard - Code Builder'
	}, [])

	return (
		<Scrollbar className="flex h-[unset] flex-1">
			<div className=" flex min-h-full flex-col p-2 sm:p-4 md:p-8">
				<div className="mb-8 flex flex-wrap gap-4">
					<button
						className="flex h-24 min-w-80 max-w-[500px] flex-1 items-center justify-between overflow-hidden rounded-md border border-transparent bg-neutral-900 hover:border-neutral-500"
						onClick={() =>
							modelStore.open({
								content: <ProjectStarter />,
								title: lang.newProject,
							})
						}
					>
						<div className="flex items-center gap-4 py-3 pl-5">
							<FaPlus className="h-6 w-6" />
							<div className="text-left">
								<h2 className="text-15">{lang.newProject}</h2>
								<p className="text-12 text-neutral-400">{lang.subNewProject}</p>
							</div>
						</div>
						<Image
							src="/NewProjectBlockpng.png"
							className="h-full bg-gradient-to-r from-transparent via-sky-400/40 via-100%"
							width={120}
							height={96}
							alt=""
						/>
					</button>
					<button className="flex h-24 min-w-80 max-w-[500px] flex-1 items-center justify-between overflow-hidden rounded-md border border-transparent bg-neutral-900 hover:border-neutral-500">
						<div className="flex items-center gap-4 py-3 pl-5">
							<FaArrowDownLong className="h-6 w-6" />
							<div className=" text-left">
								<h2 className="text-15">{lang.openGithubRepo}</h2>
								<p className="text-12 text-neutral-400">{lang.subOpenGithubRepo}</p>
							</div>
						</div>
						<Image
							src="/GithubRepoFork.svg"
							className="h-full bg-gradient-to-r from-transparent via-sky-400/40 via-100%"
							width={120}
							height={96}
							alt=""
						/>
					</button>
				</div>
				<div className="flex flex-1 flex-col">
					<div className="flex items-end justify-between">
						<h2>{lang.recentProjects}</h2>
						<Link href="/projects" className="text-12 hover:underline">
							{lang.showAll}
						</Link>
					</div>
					<div className="flex flex-1">
						<ProjectsTable
							store={{
								key: 'slug',
								loadUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/projects?take=10`,
								deleteUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/projects`,
								onBeforeSend: (method, ajaxOptions) => {
									ajaxOptions.xhrFields = { withCredentials: true }
								},
							}}
							paging={{
								enabled: false,
							}}
							selection={{
								allowSelectAll: true,
								showCheckBoxesMode: 'always',
								mode: 'multiple',
								selectAllMode: 'page',
							}}
							editing={{
								confirmDelete: true,
								allowDeleting: true,
							}}
							wordWrapEnabled={true}
							width={'100%'}
						/>
					</div>
				</div>
			</div>
		</Scrollbar>
	)
})
