import React from 'react'

type DependencyItemProps = {
	name: string
	version: string
}

function DependencyItem({ name, version }: DependencyItemProps) {
	return (
		<div className="py-2 px-3 flex items-center justify-between">
			<h3 className="text-title text-12 font-normal">{name}</h3>
			<p className="text-12">{version}</p>
		</div>
	)
}

export default DependencyItem
