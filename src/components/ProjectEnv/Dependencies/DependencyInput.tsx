import React, { ChangeEvent, useEffect, useState } from 'react'
import { Combobox } from '@headlessui/react'
import { PackageDependencyType, ResultDependencies } from '../../../utils/types'
import axios from 'axios'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import webContainerService from '../../../services/WebContainerService'
import { DependenciesProps } from '.'
import debounce from '../../../utils/debounce'

export default function DependencyInput({ createTerminal, openTerminal }: DependenciesProps) {
	const [search, setSearch] = useState('')
	const [searchDependencies, setSearchDependencies] = useState<PackageDependencyType[]>([])

	const getDependenciesByName = async (name: string) => {
		const { data } = await axios.get<ResultDependencies>(`https://registry.npmjs.org/-/v1/search?text=${name}`)
		const deps = data.objects.map<PackageDependencyType>(obj => ({
			name: obj.package.name,
			version: obj.package.version,
		}))

		setSearchDependencies(deps)
	}

	useEffect(() => {
		if (search === '') {
			setSearchDependencies([])
			return
		}
		getDependenciesByName(search)
	}, [search])

	const installDependency = (dep: PackageDependencyType) => {
		const isExist = webContainerService._terminals.findIndex(t => t.id === 'addDependency') !== -1
		if (isExist) openTerminal('addDependency')
		else createTerminal('addDependency')

		setTimeout(() => {
			webContainerService.writeCommand(
				`npm install ${dep.name}@${dep.version} --legacy-peer-deps\n`,
				'addDependency',
			)
		}, 500)
	}

	return (
		<Combobox>
			<Combobox.Input
				className="flex-shrink-0 w-full bg-zinc-800 px-3 outline-none border border-transparent text-12 h-7 focus:border-blue-500"
				onChange={debounce((event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value), 500)}
			/>
			{searchDependencies.length > 0 && (
				<OverlayScrollbarsComponent
					options={{
						scrollbars: {
							autoHide: 'leave',
						},
					}}
					className="absolute z-20 max-h-60 inset-x-4 inset-y-3 top-8 flex-1 mt-3"
					defer
				>
					<Combobox.Options className={'overflow-auto bg-neutral-950'}>
						{searchDependencies.map(dep => (
							<Combobox.Option
								className="px-3 py-2 hover:bg-neutral-800 cursor-pointer"
								onClick={() => installDependency(dep)}
								key={dep.name}
								value={dep}
							>
								{dep.name} - {dep.version}
							</Combobox.Option>
						))}
					</Combobox.Options>
				</OverlayScrollbarsComponent>
			)}
		</Combobox>
	)
}
