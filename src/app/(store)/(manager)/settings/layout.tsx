'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import React from 'react'
import { Tab } from '@headlessui/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import lang from '../../../../locale/en'
import Scrollbar from '../../../../components/Scrollbar'

const tabs = [
	{ name: lang.billing, href: '/settings/billing' },
	{ name: lang.profile, href: '/settings/profile' },
]

export default function SettingLayout({ children }: { children: React.ReactNode }) {
	const { data: session, status, update } = useSession()

	const pathname = usePathname()

	return (
		<Scrollbar className="flex h-[unset] flex-1">
			<div className="w-full max-w-4xl mx-auto p-2 sm:p-4 md:p-8">
				<div>
					{status === 'authenticated' && (
						<>
							<div className="flex items-center">
								{session.user?.image && (
									<Image
										src={session.user?.image}
										className="rounded-full flex-shrink-0 mr-2"
										width={56}
										height={56}
										alt=""
									/>
								)}
								<div>
									<p className="text-white text-2xl">{session.user?.name}</p>
								</div>
							</div>
						</>
					)}
				</div>
				<div className="flex text-13 font-bold border-b-2 text-gray-400 border-[hsl(0_0%_100%_/_0.1)] ">
					{tabs.map(tab => (
						<Link href={tab.href} key={tab.name} className=" text-gray-400 relative">
							<div className={`px-4 py-3 ${tab.href === pathname ? 'text-white' : ''}`}>{tab.name}</div>
							{tab.href === pathname && (
								<div className="absolute w-full h-[2px] leading-none bg-white"></div>
							)}
						</Link>
					))}
				</div>
				<div className="w-full max-w-4xl mx-auto py-8">{children}</div>
			</div>
		</Scrollbar>
	)
}
