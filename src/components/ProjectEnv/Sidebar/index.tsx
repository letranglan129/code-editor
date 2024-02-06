import { observer } from 'mobx-react-lite'
import { forwardRef, memo, useState } from 'react'
import { VscCommentDiscussion, VscFiles, VscGear, VscPlug, VscSearch } from 'react-icons/vsc'
import { FileExplorerProps, FileExplorerRef } from '../FileExplorer'
import Port from './Port'
import ProjectInfo from './ProjectInfo'
import Search from './Search'
import Setting from './Setting'
import Chat from './Chat'

const handlePublish = () => {}

export type SidebarRef = {
	fileExplorerRef: FileExplorerRef | null
}

export type SidebarProps = FileExplorerProps & {
	openTerminal: (_id: string) => Promise<void>
	createTerminal: () => void
}

export default memo(
	observer(
		forwardRef<SidebarRef, SidebarProps>(function Sidebar(
			{ onAddNew, onClick, onCreate, onDelete, onDoubleClick, onRename, openTerminal, createTerminal, onMove },
			ref,
		) {
			const [activeTab, setActiveTab] = useState<'files' | 'search' | 'ports' | 'chat'>('files')

			return (
				<div className="flex h-full overflow-hidden">
					<div className="h-full w-12 flex-shrink-0 bg-zinc-800">
						<button
							className={`${activeTab === 'files' ? 'border-sky-600 text-white' : 'border-transparent'} flex aspect-square w-full items-center justify-center border-l-2`}
							onClick={() => setActiveTab('files')}
						>
							<VscFiles className="text-2xl" />
						</button>
						<button
							className={`${activeTab === 'search' ? 'border-sky-600 text-white' : 'border-transparent'} flex aspect-square w-full items-center justify-center border-l-2`}
							onClick={() => setActiveTab('search')}
						>
							<VscSearch className="text-2xl" />
						</button>
						<button
							className={`${activeTab === 'ports' ? 'border-sky-600 text-white' : 'border-transparent'} flex aspect-square w-full items-center justify-center border-l-2`}
							onClick={() => setActiveTab('ports')}
						>
							<VscPlug className="text-2xl" />
						</button>
						{/* <button
							className="flex aspect-square w-full items-center justify-center"
							// onClick={() => setActiveTab('setting')}
						>
							<VscGear className="text-2xl" />
						</button> */}
						<button
							className={`${activeTab === 'chat' ? 'border-sky-600 text-white' : 'border-transparent'} flex aspect-square w-full items-center justify-center border-l-2`}
							onClick={() => setActiveTab('chat')}
						>
							<VscCommentDiscussion className="text-2xl" />
						</button>
					</div>
					<div className="flex-1 overflow-hidden">
						{
							{
								files: (
									<ProjectInfo
										onAddNew={onAddNew}
										onClick={onClick}
										onCreate={onCreate}
										onDelete={onDelete}
										onDoubleClick={onDoubleClick}
										onRename={onRename}
										openTerminal={openTerminal}
										createTerminal={createTerminal}
										onMove={onMove}
										ref={ref}
									/>
								),
								search: <Search onClick={onClick} />,
								ports: <Port />,
								chat: <Chat />,
								// setting: <Setting />,
							}[activeTab]
						}
					</div>
				</div>
			)
		}),
	),
)
