import { observer } from 'mobx-react-lite'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { memo } from 'react'
import { useProjectCodeStore } from '../../../store/projects'
import { TerminalRef } from '../Terminal'
import DependencyItem from './DependencyItem'
import DependencyInput from './DependencyInput'

export type DependenciesProps = Pick<TerminalRef, 'createTerminal' | 'openTerminal'>

export default memo(
	observer(function Dependencies({ createTerminal, openTerminal }: DependenciesProps) {
		const projectCodeStore = useProjectCodeStore()

		return (
			<div className="py-3 px-4 h-full flex flex-col relative">
				<DependencyInput createTerminal={createTerminal} openTerminal={openTerminal} />
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
