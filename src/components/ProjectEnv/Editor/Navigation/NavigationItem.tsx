import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { getVSIFileIcon } from 'file-extension-icon-js'
import { useProjectCodeStore } from '../../../../store/projects'
import { FaCircle, FaXmark } from 'react-icons/fa6'
import { observer } from 'mobx-react-lite'
import { FileTreeNomarlizedType } from '../../../../utils/types'
import { toJS } from 'mobx'
import { ContextMenuMemo } from '../../FileExplorer/Tree/TreeItem'
import { ItemInfo } from 'devextreme/events'
import { dxContextMenuItem } from 'devextreme/ui/context_menu'

type NavigationItemProps = {
	active: boolean
	data: FileTreeNomarlizedType
	isPreview: boolean
	onMouseDown: (data: FileTreeNomarlizedType) => void
	onDoubleClick: (data: any) => void
	onClose: (data: any) => void
	onCloseOthers: (data: any) => void
	onCloseAll: () => void
}

const NavigationItem = memo(
	observer<NavigationItemProps>(function NavigationItem({
		active,
		data,
		isPreview,
		onMouseDown,
		onDoubleClick,
		onClose,
		onCloseOthers,
		onCloseAll,
	}) {
		const ref = useRef<HTMLLIElement>(null)
		const { fileEntries } = useProjectCodeStore()
		const file = fileEntries?.[data.id]
		const [renderContextMenu, setRenderContextMenu] = useState<boolean>(false)

		useEffect(() => {
			// Scroll to active tab
			if (active && ref.current) {
				ref.current.scrollIntoView({ behavior: 'smooth', inline: 'nearest' })
			}
		}, [active])

		useEffect(() => {
			const element = document.getElementById(`navigation-${file.id}`)
			if (element) setRenderContextMenu(true)
		}, [])

		const contextMenuClick = useCallback((e: ItemInfo<dxContextMenuItem>) => {
			if (!e.itemData?.items) {
				switch (e.itemData?.text) {
					case 'Close':
						onClose(data)
						break
					case 'Close All':
						onCloseAll()
						break
					case 'Close Others':
						onCloseOthers(data)
						break

					default:
						break
				}
			}
		}, [])

		if (!file) return null

		return (
			<li
				ref={ref}
				id={`navigation-${file.id}`}
				className={`parent show relative flex-shrink-0 ${active ? 'bg-editor' : 'bg-[#26292e]'}`}
			>
				{/* <ContextMenuTrigger id={uniqueId} className="h-full"> */}
				<div className="h-full">
					<button
						className={`min-w-110 h-38 inline-flex h-full cursor-pointer select-none items-center gap-2 whitespace-nowrap py-0 pl-2 pr-8 text-13 text-white ${
							isPreview ? 'italic' : ''
						}`}
						onMouseDown={e => {
							// Prevent if right click
							if (e.button === 2 || e.button === 3) return
							onMouseDown(data)
						}}
						onDoubleClick={() => onDoubleClick(data)}
					>
						<img className="w-4" src={getVSIFileIcon(file.name)} alt={file.name} />
						{file.name}
						<span
							className={`absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded p-1 hover:bg-neutral-800`}
							onMouseDown={e => e.stopPropagation()}
							onClick={() => onClose(data)}
						>
							<FaCircle className={`unchild h-2 w-2 ${file.isChanged ? 'block' : '!hidden'}`} />
							<FaXmark className="child" />
						</span>
					</button>
				</div>
				{renderContextMenu && (
					<ContextMenuMemo
						target={document.getElementById(`navigation-${file.id}`)}
						contextMenuClick={contextMenuClick}
						dataSource={[
							{ text: 'Close' },
							{ text: 'Close Others' },
							{ text: 'Close All' },
						]}
					/>
				)}
			</li>
		)
	}),
)

export default NavigationItem
