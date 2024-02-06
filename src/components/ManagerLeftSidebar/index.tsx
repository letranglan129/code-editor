import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FaAngleDown, FaCodeFork, FaRegClock, FaClipboardList, FaBox, FaGears } from 'react-icons/fa6'
import lang from '../../locale/en'

const list = [
	{
		title: lang.dashboard,
		href: '/dashboard',
		icon: <FaRegClock />,
	},
	{
		title: lang.repos,
		href: '/repositories',
		icon: <FaCodeFork />,
	},
	{
		title: lang.projects,
		href: '/projects',
		icon: <FaClipboardList />,
	},
	{
		title: lang.settings,
		href: '/settings/billing',
		icon: <FaGears />,
	},
]

export default function ManagerLeftSidebar() {
	const { data: session, status, update } = useSession()

	return (
		<div className="pt-6 px-3 pb-4">
			<button className="flex items-center w-full justify-between hover:bg-neutral-600 p-3 hover:bg-opacity-50 rounded-md">
				{status === 'authenticated' && (
					<>
						<div className="flex items-center">
							{session.user?.image && (
								<Image
									src={session.user?.image}
									className="rounded-full flex-shrink-0 mr-2"
									width={32}
									height={32}
									alt=""
								/>
							)}
							<div>
								<p className="text-white text-13">{session.user?.name}</p>
							</div>
						</div>
						<FaAngleDown />
					</>
				)}
			</button>
			<ul>
				{list.map(({ title, href, icon }) => (
					<li key={title}>
						<Link href={href} className="flex items-center w-full justify-between hover:bg-neutral-600 p-3 hover:bg-opacity-50 rounded-md">
							<div className="flex items-center">
								{icon && <span className="mr-2">{icon}</span>}
								<div>
									<p className="text-white text-13">{title}</p>
								</div>
							</div>
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
