import React from 'react'
import lang from '../../../../../locale/en'

const infos = [
	{
		title: 'Name',
		content: 'letranglan129',
	},
	{
		title: 'Bio',
		content: 'A few words about you',
	},
	{
		title: 'Location',
		content: 'Where are you?',
	},
	{
		title: 'Site',
		content: 'Website or social media',
	},
]

export default function ProfilePage() {
	return (
		<div className="text-neutral-300">
			<div className="flex items-center mb-4">
				<div className="text-lg font-semibold mr-4">User infomation</div>
				<button className="text-12 border border-neutral-700 px-3 py-1 rounded-md">Edit</button>
			</div>

			<div className="text-14 pb-6">
				{infos.map(info => (
					<div className="pt-2 pb-4" key={info.title}>
						<div className="text-neutral-300 font-semibold mb-3">{info.title}</div>
						<p className="text-neutral-500 italic">{info.content}</p>
					</div>
				))}
			</div>

			<hr className="border-neutral-600" />

			<div className="mt-6">
				<div className="text-lg font-semibold mr-4">Account deletion</div>
				<p className="text-13 font-normal mt-2 text-neutral-400">
					In case of deletion you’ll remove all your projects and personal data. Also you’ll lose control of
					projects in your organizations.
				</p>

				<button className="text-12 border border-neutral-700 px-3 py-1 rounded-md mt-6">
					Delete my account
				</button>
			</div>
		</div>
	)
}
