import { observer } from 'mobx-react-lite'
import { ForwardedRef, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Tree, TreeApi, useSimpleTree, MoveHandler, NodeApi } from 'react-arborist'
import { useProjectCodeStore } from '../../../store/codeEditor/projects'
import { treeSort } from '../../../utils/trees'
import TreeItem from './Tree/TreeItem'
import { FileDataType, FileTreeNomarlizedType } from '../../../utils/types'
import { listenEvent } from '../../../utils/events'
import projectService from '../../../services/ProjectSerivce'
import { toJS } from 'mobx'

let openState = {}
let lastSelectedId: string = ''

export type FileExplorerRefType = {
	mostRecentNode: NodeApi<FileTreeNomarlizedType> | null | undefined
	selectedNodes: NodeApi<FileTreeNomarlizedType>[] | undefined
	select(id: string): void
	scrollTo(id: string): void
}

type FileExplorerProps = {
	onMove: MoveHandler<FileTreeNomarlizedType>
	onRename: ({ newPath, oldPath }: { oldPath: string; newPath: string }) => void
	onCreate: (file: FileDataType) => void
	onAddNew: (type: string) => void
	onDelete: (data: FileTreeNomarlizedType) => void
	onClick: (data: FileTreeNomarlizedType) => void
	onDoubleClick: (data: FileTreeNomarlizedType) => void
}

export default memo(
	observer(
		forwardRef<FileExplorerRefType, FileExplorerProps>(function FileExplorer(
			{ onMove, onRename, onCreate, onAddNew, onDelete, onClick, onDoubleClick },
			ref,
		) {
			const projectCodeStore = useProjectCodeStore()
			const treeFiles = projectCodeStore.treeFiles
			const treeRef = useRef<TreeApi<FileTreeNomarlizedType> | undefined>()
			const [simpleTreeFiles, controls] = useSimpleTree(treeFiles)

			// Handles open and select current file (open in the editor).
			useEffect(() => {
				const remove = listenEvent(
					'tree:file-change',
					({ detail: file }: { detail: FileTreeNomarlizedType }) => {
						treeRef.current?.select(file.id)
						treeRef.current?.scrollTo(file.id)
					},
				)

				return remove
			}, [])

			const handleMove: MoveHandler<FileTreeNomarlizedType> = args => {
				onMove(args)
				controls.onMove(args)
			}

			const handleSelect = useCallback(() => {
				const selectedIds = Array.from(treeRef.current?.selectedIds || [])
				if (selectedIds.length === 0) return

				const selectEntry = projectService.getEntryFromId(selectedIds[0])
				if (!selectEntry?.isCreating) {
					lastSelectedId = selectedIds[0]
				}
			}, [])

			const saveOpenState = () => {
				requestIdleCallback(() => {
					if (!treeRef.current) return
					openState = { ...treeRef.current.openState }
				})
			}

			useEffect(() => {
				if (!simpleTreeFiles.length) return
				requestIdleCallback(() => {
					saveOpenState()
				})
			}, [simpleTreeFiles])

			useImperativeHandle(
				ref,
				() => ({
					get mostRecentNode() {
						return treeRef.current?.mostRecentNode
					},
					get selectedNodes() {
						return treeRef.current?.selectedNodes
					},
					select(id: string) {
						treeRef.current?.select(id)
					},
					scrollTo(id: string) {
						treeRef.current?.scrollTo(id)
					},
				}),
				[],
			)

			useEffect(() => {
				if (lastSelectedId) treeRef.current?.select(lastSelectedId)
			}, [])

			return (
				<div className="py-3 px-4" id="file-explorer">
					<Tree
						ref={treeRef}
						data={treeSort(simpleTreeFiles as FileTreeNomarlizedType[]) || []}
						width="100%"
						className="!overflow-hidden file-explorer-tree"
						onSelect={handleSelect}
						onMove={handleMove}
						onClick={saveOpenState}
						initialOpenState={openState}
						height={400}
						indent={10}
						rowHeight={22}
						padding={10}
						renderCursor={() => null}
						openByDefault={false}
					>
						{({ node, style, tree, dragHandle }) => {
							if (node.level === 0) node.open()
							return (
								<TreeItem
									node={node}
									style={style}
									dragHandle={dragHandle}
									tree={tree}
									onRename={onRename}
									onCreate={onCreate}
									onAddNew={onAddNew}
									onDelete={onDelete}
									onClick={onClick}
									onDoubleClick={onDoubleClick}
								/>
							)
						}}
					</Tree>
				</div>
			)
		}),
	),
)
