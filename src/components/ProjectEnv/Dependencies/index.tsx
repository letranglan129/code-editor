import React, { memo, useEffect, useState } from 'react'
import { useProjectCodeStore } from '../../../store/codeEditor/projects'
import DependencyItem from './DependencyItem'
import { observer } from 'mobx-react-lite'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import axios from 'axios'
import { PackageDependencyType, ResultDependencies } from '../../../utils/types'
import { Combobox } from '@headlessui/react'
import webContainerService from '../../../services/WebContainerService'
import { TerminalRefType } from '../Terminal'

type DependenciesProps = Pick<TerminalRefType, 'createTerminal' | 'openTerminal'>

export default memo(
	observer(function Dependencies({ createTerminal, openTerminal }: DependenciesProps) {
		const projectCodeStore = useProjectCodeStore()
		const [search, setSearch] = useState('')
		const [searchDependencies, setSearchDependencies] = useState<PackageDependencyType[]>([])

		const getDependenciesByName = async (name: string) => {
			const { data } = await axios.get<ResultDependencies>(`https://registry.npmjs.org/-/v1/search?text=${name}`)
			const deps = data.objects.map<PackageDependencyType>(obj => ({
				name: obj.package.name,
				version: obj.package.version,
			}))

			console.log(deps)
			setSearchDependencies(deps)
		}

		useEffect(() => {
			if (search === '') {
				setSearchDependencies([])
				return
			}
			// console.log(search);
			getDependenciesByName(search)
		}, [search])

		return (
			<div className="py-3 px-4 h-full flex flex-col relative">
				<Combobox>
					<Combobox.Input
						className="flex-shrink-0 w-full bg-zinc-800 px-3 outline-none border border-transparent text-12 h-7 focus:border-blue-500"
						onChange={event => setSearch(event.target.value)}
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
										onClick={() => {
											const isExist =
												webContainerService._terminals.findIndex(
													t => t.id === 'addDependency',
												) !== -1
											if (isExist) openTerminal('addDependency')
											else createTerminal('addDependency')

											setTimeout(() => {
												webContainerService.writeCommand(
													`npm install ${dep.name}@${dep.version} --legacy-peer-deps\n`,
													'addDependency',
												)
											}, 500)
										}}
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
				<OverlayScrollbarsComponent
					options={{
						scrollbars: {
							autoHide: 'leave',
						},
					}}
					className="flex-1 dependencies-scrollbar"
					defer
				>
					{projectCodeStore.packageDependencies.map((pkg, i) => (
						<DependencyItem name={pkg.name} version={pkg.version} key={pkg.name} />
					))}
				</OverlayScrollbarsComponent>
			</div>
		)
	}),
)
