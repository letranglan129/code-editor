import { memo, useEffect, useRef } from 'react'
import { getVSIFileIcon } from 'file-extension-icon-js'
import { ContextMenu, ContextMenuItem, ContextMenuTrigger } from 'rctx-contextmenu'
import { useProjectCodeStore } from '../../../../store/codeEditor/projects'
import { FaCircle, FaXmark } from 'react-icons/fa6'
import { observer } from 'mobx-react-lite'
import { FileTreeNomarlizedType } from '../../../../utils/types'

type NavigationItemProps = {
	active: boolean
	data: FileTreeNomarlizedType
	isPreview: boolean
	onMouseDown: (data: FileTreeNomarlizedType) => void
	onDoubleClick: (data: any) => void
	onClose: (data: any) => void
	// onCloseOthers: (data: any) => void
	// onCloseAll: () => void
}

const NavigationItem = memo(
	observer<NavigationItemProps>(function NavigationItem({
		active,
		data,
		isPreview,
		onMouseDown,
		onDoubleClick,
		onClose,
		// onCloseOthers,
		// onCloseAll,
	}) {
		const ref = useRef<HTMLLIElement>(null)
		const { fileEntries } = useProjectCodeStore()
		const file = fileEntries?.[data.id]

		useEffect(() => {
			// Scroll to active tab
			if (active && ref.current) {
				ref.current.scrollIntoView({ behavior: 'smooth', inline: 'nearest' })
			}
		}, [active])

		if (!file) return null

		const uniqueId = `tab-context-menu-${file.id}`
		console.log(active)

		return (
			<li ref={ref} className={`relative flex-shrink-0 parent show ${active ? 'bg-editor' : 'bg-[#26292e]'}`}>
				<ContextMenuTrigger id={uniqueId} className="h-full">
					<button
						className={`inline-flex items-center gap-2 min-w-110 h-38 py-0 pr-8 pl-2 text-13 cursor-pointer whitespace-nowrap select-none h-full text-white ${
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
							className={`absolute top-1/2 right-1 -translate-y-1/2 items-center justify-center p-1 rounded  hover:bg-neutral-800`}
							onMouseDown={e => e.stopPropagation()}
							onClick={() => onClose(data)}
						>
							<FaCircle className="hidden" />
							<FaXmark className="child" />
						</span>
					</button>
				</ContextMenuTrigger>
				<ContextMenu id={uniqueId} className="min-w-48">
					{/* <ContextMenuItem onClick={() => onClose(data)}>Close</ContextMenuItem> */}
					{/* <ContextMenuItem onClick={() => onCloseOthers(data)}>Close Others</ContextMenuItem> */}
					{/* <ContextMenuItem onClick={onCloseAll}>Close All</ContextMenuItem> */}
				</ContextMenu>
			</li>
		)
	}),
)

export default NavigationItem
