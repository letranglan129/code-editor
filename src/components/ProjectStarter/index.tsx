'use client'

import { Tab } from '@headlessui/react'
import axios from 'axios'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo } from 'react'
import { useProjectStarterStore } from '../../store/starterCode'
import { uuidv4 } from '../../utils/strings'
import lang from '../../locale/en'
import { getIcon } from '../../utils/icon'
import { useRouter } from 'next/navigation'

type ProjectStarterGroupItem = {
	title: string
	index: number
	children: {
		icon?: string
		language?: string
		name: string
		href: string
	}[]
}

export const tabOrders = [
	lang.popular,
	lang.frontend,
	lang.backend,
	lang.fullstack,
	lang.vite,
	lang.vanilla,
	lang.mobile,
].map(el => el.toLowerCase())

export default observer(function ProjectStarter() {
	const projectStarterStore = useProjectStarterStore()
	const router = useRouter()

	const tabs = useMemo(() => {
		return projectStarterStore.projectStarters
			.reduce((acc, curr) => {
				curr.type.forEach(type => {
					const index = acc.findIndex(item => item.title === type)

					if (index !== -1) {
						acc[index].children.push({
							href: curr.slug as string,
							icon: curr.icon,
							language: curr.core,
							name: curr.title,
						})
					} else {
						acc.push({
							title: type,
							children: [
								{
									href: curr.slug as string,
									icon: curr.icon,
									language: curr.core,
									name: curr.title,
								},
							],
							index: tabOrders.indexOf(type),
						})
					}
				})

				return acc
			}, [] as ProjectStarterGroupItem[])
			.sort((a, b) => a.index - b.index)
	}, [projectStarterStore.projectStarters])

	const cloneProject = useCallback(async (slug: string) => {
		const { data } = await axios.get(`/api/projects/${slug}/clone`)

		window.location.href = `/projects/${data.slug}`
	}, [])

	return (
		<Tab.Group>
			<Tab.List className="flex flex-wrap justify-center text-center">
				{tabs.map(({ title }) => (
					<Tab className="flex-shrink-0 outline-none " key={title}>
						{({ selected }) => (
							<span
								className={`flex border-b-2 px-4 py-3 text-14 font-semibold capitalize text-gray-400 hover:text-white ${
									selected ? 'border-cyan-400' : 'border-transparent'
								}`}
							>
								{title}
							</span>
						)}
					</Tab>
				))}
			</Tab.List>
			<Tab.Panels className="mt-10">
				{tabs.map(({ children }, idx) => (
					<Tab.Panel key={idx}>
						<div className="flex flex-wrap justify-center gap-3">
							{children.map(({ icon, language, name, href }) => (
								<div
									key={uuidv4()}
									onClick={() => cloneProject(href)}
									className="flex min-w-64 max-w-64 cursor-pointer items-center rounded-md bg-[#272a30] bg-opacity-60 p-5 transition-all hover:translate-x-0.5 hover:bg-transparent hover:shadow-[inset_0_0_0_1px_#22d3ee]"
								>
									{getIcon(icon || '')}
									<div>
										<p className="text-14 font-bold text-neutral-400">{name}</p>
										<p className="text-13 font-light text-neutral-400">{language}</p>
									</div>
								</div>
							))}
						</div>
					</Tab.Panel>
				))}
			</Tab.Panels>
		</Tab.Group>
	)
})
