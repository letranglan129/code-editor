'use client'

import { useEffect } from 'react'

export default function BillingPage() {
	
	useEffect(() => {
		document.title = 'Billing - Code Builder'
	}, [])

	return (
		<div className="flex gap-6 flex-wrap">
			<div className="flex flex-col flex-1 gap-6 p-6 sm:max-w-80 max-w-full min-w-60 bg-gray-700 bg-opacity-40 text-gray-300 border rounded-md border-gray-600">
				<div className="text-base uppercase">Current plan</div>

				<div>
					<h3 className="text-4xl font-extrabold text-gray-100">Free</h3>
					<p className="text-12 font-normal mt-2">Lifetime</p>
				</div>

				<div>
					<button className="bg-blue-600 text-white w-full py-2 px-4 text-14 rounded-sm">
						Upgrade to Personal+
					</button>
				</div>

				<div className="text-12">
					<h6 className="font-bold mb-3 text-gray-50">New features included:</h6>
					<ul className="list-disc pl-3 text-neutral-400">
						<li className="mb-1 leading-relaxed">Unlimited uploads</li>
						<li className="mb-1 leading-relaxed">Multi-player private projects</li>
					</ul>
				</div>
			</div>

			<div className="flex flex-col flex-1 gap-6 p-6 sm:max-w-80 max-w-full min-w-60 bg-gray-700 bg-opacity-40 text-gray-300 border rounded-md border-gray-600">
				<div className="text-base uppercase">TEAMS</div>

				<div>
					<h3 className="text-4xl font-extrabold text-gray-100">$29/month</h3>
					<p className="text-12 font-normal mt-2">
						Per member per month billed annually or $35 billed monthly
					</p>
				</div>

				<div>
					<button className="bg-blue-600 text-white w-full py-2 px-4 text-14 rounded-md">
						Upgrade to Personal+
					</button>
				</div>

				<div className="text-12">
					<h6 className="font-bold mb-3 text-gray-50">Everything from Personal, plus:</h6>
					<ul className="list-disc pl-3 text-neutral-400">
						<li className="mb-1 leading-relaxed">Collaborate on projects and collections</li>
						<li className="mb-1 leading-relaxed">
							Open and collaborate on your organization’s GitHub repositories
						</li>
						<li className="mb-1 leading-relaxed">
							Integrate with private NPM registries, Artifactory, and Nexus
						</li>
						<li className="mb-1 leading-relaxed">Sync user permissions from your GitHub organization</li>
						<li className="mb-1 leading-relaxed">Team management and billing console</li>
						<li className="mb-1 leading-relaxed">Email support</li>
					</ul>
				</div>
			</div>
		</div>
	)
}
