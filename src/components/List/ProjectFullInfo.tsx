import React from 'react'
import { IProject } from '../../modules/mongo/schema/Project'
import { FaCodeFork, FaEye } from 'react-icons/fa6'
import moment from 'moment'
import { getIcon } from '../../utils/icon'

export default function ProjectFullInfo(item: IProject) {
	return (
		<div>
			<div className="text-13 font-bold text-sky-500">{item.title}</div>
			<div className="my-2 text-13 text-neutral-400">{item.description}</div>
			<div className="flex gap-8 text-12 text-neutral-400">
				<div className="flex">
					{getIcon(item.icon, 'w-4 h-4')} <span>{item.core}</span>
				</div>
				<div>
					<FaEye className="inline-block" /> {item.views_count}
				</div>
				<div>
					<FaCodeFork className="inline-block" /> {item.views_count}
				</div>

				<div>Updated {moment(item.updatedAt).fromNow()}</div>
			</div>
		</div>
	)
}
