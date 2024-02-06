import { observer } from 'mobx-react-lite'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { MoveHandler, NodeApi, Tree, TreeApi, useSimpleTree } from 'react-arborist'
import editorService from '../../../services/EditorService'
import projectService from '../../../services/ProjectSerivce'
import { useProjectCodeStore } from '../../../store/projects'
import { treeSort } from '../../../utils/trees'
import { FileDataType, FileTreeNomarlizedType } from '../../../utils/types'
import TreeItem from './Tree/TreeItem'

let openState = {}
let lastSelectedId: string = ''

export type FileExplorerRef = {
	mostRecentNode: NodeApi<FileTreeNomarlizedType> | null | undefined
	focusedNode: NodeApi<FileTreeNomarlizedType> | null | undefined
	selectedNodes: NodeApi<FileTreeNomarlizedType>[] | undefined
	select(id: string): void
	scrollTo(id: string): void
	getMostRecentNode: () => NodeApi<FileTreeNomarlizedType> | null | undefined
}

export type FileExplorerProps = {
	onMove: MoveHandler<FileTreeNomarlizedType>
	onRename: ({ newPath, oldPath }: { oldPath: string; newPath: string }) => void
	onCreate: (file: FileDataType) => void
	onAddNew: (type: string) => void
	onDelete: (data: FileDataType) => void
	onClick: (data: FileTreeNomarlizedType) => void
	onDoubleClick: (data: FileTreeNomarlizedType) => void
}

export default memo(
	observer(
		forwardRef<FileExplorerRef, FileExplorerProps>(function FileExplorer(
			{ onMove, onRename, onCreate, onAddNew, onDelete, onClick, onDoubleClick },
			ref,
		) {
			const projectCodeStore = useProjectCodeStore()
			const treeFiles = projectCodeStore.treeFiles
			const treeRef = useRef<TreeApi<FileTreeNomarlizedType> | undefined>()
			const [simpleTreeFiles, controls] = useSimpleTree(treeFiles)

			// Handles open and select current file (open in the editor).
			// useEffect(() => {
			// 	const remove = listenEvent(
			// 		'tree:file-change',
			// 		({ detail: file }: { detail: FileTreeNomarlizedType }) => {
			// 			treeRef.current?.select(file.id)
			// 			treeRef.current?.scrollTo(file.id)
			// 		},
			// 	)

			// 	return remove
			// }, [])

			const handleMove: MoveHandler<FileTreeNomarlizedType> = args => {
				onMove(args)
				controls.onMove(args)
			}

			const handleSelect = useCallback(() => {
				const selectedIds = Array.from(treeRef.current?.selectedIds || [])

				if (selectedIds.length === 0) {
					const file = editorService.getCurrentFile()
					if (!file) return

					treeRef.current?.select(file.id)
				}

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
			
			const getMostRecentNode = () => {
				return treeRef.current?.mostRecentNode
			}

			useImperativeHandle(
				ref,
				() => ({
					getMostRecentNode,
					get mostRecentNode() {
						return treeRef.current?.get(lastSelectedId)
					},
					get focusedNode() {
						return treeRef.current?.focusedNode
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
			)

			useEffect(() => {
				if (lastSelectedId) treeRef.current?.select(lastSelectedId)
			}, [])
			
			return (
				<div className="px-4 py-3" id="file-explorer">
					<Tree
						ref={treeRef}
						className="file-explorer-tree"
						data={treeSort(simpleTreeFiles as FileTreeNomarlizedType[]) || []}
						openByDefault={false}
						initialOpenState={openState}
						width="100%"
						height={400}
						indent={10}
						rowHeight={22}
						padding={10}
						renderCursor={() => null}
						onMove={handleMove}
						onSelect={handleSelect}
						onClick={saveOpenState}
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
