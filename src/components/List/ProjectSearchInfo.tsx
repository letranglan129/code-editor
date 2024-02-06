import React from 'react'
import { IProject } from '../../modules/mongo/schema/Project'
import { FaCodeFork, FaEye } from 'react-icons/fa6'
import moment from 'moment'
import { getIcon } from '../../utils/icon'

export default function ProjectSearchInfo(item: IProject) {
	return (
		<div className="flex">
			{getIcon(item.icon, 'w-4 h-4 flex-shrink-0')}
			<div>
				<div className="flex text-13 text-neutral-300">{item.title}</div>
				<div className="mt-1 text-13 text-neutral-400">{item.slug}</div>
			</div>
		</div>
	)
}
