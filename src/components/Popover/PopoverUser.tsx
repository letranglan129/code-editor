import React from 'react'
import Popover from '.'
import Image from 'next/image'
import { IoHome, IoOptions, IoPersonCircleOutline } from 'react-icons/io5'
import lang from '../../locale/en'
import { signOut, useSession } from 'next-auth/react'
import { GiExitDoor } from 'react-icons/gi'
import Link from 'next/link'

export default function PopoverUser() {
	const { data: session, status } = useSession()
	return (
		<Popover
			title={false}
			handler={
				<Image
					src={session?.user?.image}
					className="flex-shrink-0 rounded-full"
					width={24}
					height={24}
					alt=""
				/>
			}
			className="personal-popover"
			padding={false}
			overlay
		>
			<div className="w-56">
				<div className="flex flex-col items-center justify-center px-2 pb-1 pt-5">
					<Image src={session?.user?.image} className="rounded-full" width={80} height={80} alt="" />
					<div className="mt-2">{session?.user.name}</div>
					<div className="text-13">{session?.user.email}</div>
				</div>
				<div className="py-2">
					<hr className="my-2 border-neutral-600" />
					<div className="text-13">
						<Link
							href="/dashboard"
							className="flex items-center px-4 py-1.5 hover:bg-slate-600 hover:bg-opacity-30"
						>
							<IoHome className="mr-2" /> {lang.yourDashboard}
						</Link>
						<Link
							href="/profile"
							className="flex items-center px-4 py-1.5 hover:bg-slate-600 hover:bg-opacity-30"
						>
							<IoPersonCircleOutline className="mr-2" /> {lang.yourProfile}
						</Link>
						<Link
							href="/settings/billing"
							className="flex items-center px-4 py-1.5 hover:bg-slate-600 hover:bg-opacity-30"
						>
							<IoOptions className="mr-2" /> {lang.yourSettings}
						</Link>
					</div>
					<hr className="my-2 border-neutral-600" />
					<div className="text-13">
						<div
							className="flex items-center px-4 py-1.5 hover:bg-slate-600 hover:bg-opacity-30"
							onClick={() => signOut()}
						>
							<GiExitDoor className="mr-2" /> {lang.logout}
						</div>
					</div>
				</div>
			</div>
		</Popover>
	)
}
