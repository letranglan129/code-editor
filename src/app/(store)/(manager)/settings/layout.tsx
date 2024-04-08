'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import Scrollbar from '../../../../components/Scrollbar'
import isAuth from '../../../../components/isAuth'
import lang from '../../../../locale/en'

const tabs = [
	{ name: lang.billing, href: '/settings/billing' },
	{ name: lang.profile, href: '/settings/profile' },
]

export default isAuth(function SettingLayout({ children }: { children: React.ReactNode }) {
	const { data: session, status, update } = useSession()
	const pathname = usePathname()

	return (
		<Scrollbar className="flex h-[unset] flex-1">
			<div className="mx-auto w-full max-w-4xl p-2 sm:p-4 md:p-8">
				<div>
					{status === 'authenticated' && (
						<>
							<div className="flex items-center">
								{session.user?.image && (
									<Image
										src={session.user?.image}
										className="mr-2 flex-shrink-0 rounded-full"
										width={56}
										height={56}
										alt=""
									/>
								)}
								<div>
									<p className="text-2xl text-white">{session.user?.name}</p>
								</div>
							</div>
						</>
					)}
				</div>
				<div className="flex border-b-2 border-[hsl(0_0%_100%_/_0.1)] text-13 font-bold text-gray-400 ">
					{tabs.map(tab => (
						<Link href={tab.href} key={tab.name} className=" relative text-gray-400">
							<div className={`px-4 py-3 ${tab.href === pathname ? 'text-white' : ''}`}>{tab.name}</div>
							{tab.href === pathname && (
								<div className="absolute h-[2px] w-full bg-white leading-none"></div>
							)}
						</Link>
					))}
				</div>
				<div className="mx-auto w-full max-w-4xl py-8">{children}</div>
			</div>
		</Scrollbar>
	)
})
