'use client'

import Image from 'next/image'
import Link from 'next/link'
import './home.css'

import { signOut, useSession } from 'next-auth/react'
import 'overlayscrollbars/overlayscrollbars.css'
import ProjectStarter from '../components/ProjectStarter'
import Scrollbar from '../components/Scrollbar'
import { StoreProvider } from '../store'
import lang from '../locale/en'
import Popover from '../components/Popover'
import { IoHome, IoOptions, IoPersonCircleOutline } from 'react-icons/io5'
import { GiExitDoor } from 'react-icons/gi'
import PopoverUser from '../components/Popover/PopoverUser'

const links = [
	{ href: '/', label: lang.home },
	{ href: '/dashboard', label: lang.dashboard },
	{ href: '/about', label: lang.code },
	{ href: '/builder', label: lang.builder },
]

export default function Page() {
	const { data: session, status, update } = useSession()

	return (
		<StoreProvider>
			<Scrollbar>
				<div className="container mx-auto min-h-screen">
					<header className="flex h-20 items-center justify-between">
						<div>
							<Image className="rounded-md" src="/logo.svg" alt="" width={40} height={40} />
						</div>
						<nav>
							<ul className="flex list-none items-center justify-evenly">
								{links.map(({ href, label }) => (
									<li
										key={label}
										className="px-4 py-3 text-14 font-bold text-neutral-400 hover:text-white"
									>
										<Link href={href}>{label}</Link>
									</li>
								))}
							</ul>
						</nav>
						<div>
							{status === 'authenticated' && <>{session.user?.image && <PopoverUser />}</>}
							{status === 'unauthenticated' && (
								<>
									<a
										href="/register"
										className="px-6 py-3 text-14 font-bold text-neutral-400 hover:text-white"
									>
										{lang.register}
									</a>
									<a
										href="/login"
										className="rounded-md bg-white px-6 py-3 text-14 font-bold text-neutral-950 hover:bg-neutral-200"
									>
										{lang.login}
									</a>
								</>
							)}
						</div>
					</header>
					<section className="mt-10 flex items-center">
						<section className="">
							<h1 className="text-8xl font-bold">
								Click.
								<br />
								Collaborate.
								<br />
								<strong className="text-cyan-400">Coding ngay.</strong>
							</h1>
							<p className="mt-14 text-lg text-gray-400">
								Stay in the flow with instant dev experiences. No more hours stashing/pulling/installing
								locally — just click, and start coding.
							</p>
						</section>
					</section>
					<section className="mx-auto mt-20 max-w-6xl pb-20">
						<div className="">
							<h2 className="mb-4 text-center text-4xl">Boot a fresh environment in milliseconds.</h2>
							<ProjectStarter />
						</div>
					</section>
				</div>
			</Scrollbar>
		</StoreProvider>
	)
}
