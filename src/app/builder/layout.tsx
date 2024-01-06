import { Metadata } from 'next'
import '@/app/globals.css'

export const metadata: Metadata = {
	title: 'Builder',
	description: '',
}

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div id="headlessui-portal-root">
				<div></div>
			</div>
			{children}
		</>
	)
}
