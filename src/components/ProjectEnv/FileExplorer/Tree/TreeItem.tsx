import ContextMenu from 'devextreme-react/context-menu'
import { ItemInfo } from 'devextreme/events'
import { dxContextMenuItem } from 'devextreme/ui/context_menu'
import { observer } from 'mobx-react-lite'
import React, { ChangeEvent, KeyboardEvent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from 'react'
import { NodeApi, TreeApi } from 'react-arborist'
import { useDropzone } from 'react-dropzone'
import {
	FaChevronDown,
	FaChevronRight,
	FaCircle,
	FaFileCirclePlus,
	FaFolderPlus,
	FaPen,
	FaTrash,
} from 'react-icons/fa6'
import { uint8ArrayToBase64, uint8ArrayToString } from 'uint8array-extras'
import webContainerService from '../../../../services/WebContainerService'
import { useProjectCodeStore } from '../../../../store/projects'
import { listenEvent } from '../../../../utils/events'
import { isMediaFile } from '../../../../utils/strings'
import { convertFilesToContainerTrees } from '../../../../utils/trees'
import { FileDataType, FileTreeNomarlizedType } from '../../../../utils/types'
import TreeIcon from './TreeIcon'

type TreeItemProps = {
	node: NodeApi<FileTreeNomarlizedType>
	style: React.CSSProperties
	dragHandle: ((el: HTMLDivElement | null) => void) | undefined
	tree: TreeApi<FileTreeNomarlizedType>
	onRename: ({ newPath, oldPath }: { oldPath: string; newPath: string }) => void
	onCreate: (file: FileDataType) => void
	onAddNew: (type: string) => void
	onDelete: (data: FileDataType) => void
	onClick: (data: FileTreeNomarlizedType) => void
	onDoubleClick: (data: FileTreeNomarlizedType) => void
}

export default memo(
	observer(function TreeItem({
		node,
		style,
		dragHandle,
		tree,
		onRename,
		onCreate,
		onAddNew,
		onDelete,
		onClick,
		onDoubleClick,
	}: TreeItemProps) {
		const projectCodeStore = useProjectCodeStore()
		const file = projectCodeStore.fileEntries[node.data.id]

		const [error, setError] = useState<string>('')
		const [editMode, setEditMode] = useState<boolean>(false)
		const isEditing = file?.isCreating || editMode
		const inputRef = useRef<HTMLInputElement>(null)
		const [renderContextMenu, setRenderContextMenu] = useState<boolean>(false)
		const [isDropzoneActive, setIsDropzoneActive] = useState(false)

		function readFileAsArrayBuffer(file: File, path: string) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => {
					let buffer = new Uint8Array(reader.result as ArrayBuffer)
					resolve({
						// @ts-ignore
						path: file.path,
						content: isMediaFile(file.name)
							? // @ts-ignore
								uint8ArrayToBase64(buffer)
							: // @ts-ignore
								uint8ArrayToString(buffer) || '',
					})
				}
				reader.onerror = () => {
					reader.abort()
					reject(new Error('Error reading file.'))
				}
				reader.readAsArrayBuffer(file)
			})
		}

		async function readFilesAsArrayBuffer(files: File[]) {
			// @ts-ignore
			const fileReadPromises = files.map(file => readFileAsArrayBuffer(file, file.path))
			return Promise.all(fileReadPromises)
		}

		const { getRootProps, isDragActive, isDragAccept, isDragReject, rootRef } = useDropzone({
			onDropAccepted: (files: File[]) => {
				readFilesAsArrayBuffer(files)
					.then(result => {
						webContainerService
							.getWebContainer()
							.mount(convertFilesToContainerTrees(result as { path: string; content: string }[]), {
								mountPoint: file.path === 'project' ? undefined : file.path,
							})
					})
					.catch(error => {
						console.error(error)
					})

				setIsDropzoneActive(false)
			},
			onDragOver: () => {
				setIsDropzoneActive(true)
			},
			onDragLeave: () => {
				setIsDropzoneActive(false)
			},
			noClick: true,
		})

		useEffect(() => {
			if (isEditing) {
				if (inputRef.current) inputRef.current.value = file?.name

				requestIdleCallback(() => {
					if (!inputRef.current) return
					inputRef.current.focus()

					if (!editMode) return
					const extIdx = file?.name.lastIndexOf('.')
					inputRef.current.setSelectionRange(0, extIdx === 0 ? file?.name.length : extIdx)
				})
			}
		}, [isEditing, editMode, file])

		const handleRef = useCallback(
			(ref: HTMLDivElement | null) => {
				if (isEditing || !dragHandle) return
				return dragHandle(ref)
			},
			[isEditing, dragHandle],
		)

		const handleMouseUp = useCallback(
			(e: MouseEvent<HTMLDivElement, MouseEvent>) => {
				// Focus with right click
				if (e.button !== 2 && e.button !== 3) return
				node.focus()
			},
			[node],
		)

		const handleBlur = useCallback(() => {
			const newFile = { ...file, name: inputRef.current?.value.trim() || '' }
			if (editMode) {
				setEditMode(false)
				!error &&
					file?.path &&
					onRename({
						oldPath: file?.path,
						newPath: file?.path.replace(new RegExp(`${file?.name}$`), newFile.name),
					})
			} else {
				onCreate({ ...newFile, name: error ? '' : newFile.name })
			}
		}, [editMode, error, file, onCreate, onRename])

		const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value.trim()
			const invalidChars = ['\\', ':', '*', '?', '"', '<', '>', '|', '..', '&', '%', '$', '#', '@', '!', ',', ';']
			const notStartsWith = ['/', '\\']
			const invalidChar = invalidChars.find(char => value.includes(char))
			const notStartWith = notStartsWith.find(char => value.startsWith(char))

			if (invalidChar) {
				setError(`The name cannot contain the character "${invalidChar}".`)
			} else if (value === '/') {
				setError('A file or folder name must be provided.')
			} else if (notStartWith) {
				setError(`The name cannot start with "${notStartWith}".`)
			} else {
				setError('')
			}
		}, [])

		const handleEdit = useCallback(() => {
			node.select()
			setEditMode(true)
		}, [node])

		const confirmDelete = useCallback(() => {
			if (window.confirm(`Are you sure you want to delete ${file?.name}?`)) {
				onDelete(file)
			}
		}, [file, onDelete])

		const getExplorer = useCallback((): HTMLDivElement | null => {
			return document.querySelector('.file-explorer-tree > div')
		}, [])

		const handleKeyDown = useCallback(
			(e: any) => {
				const value = e.target.value.trim()

				switch (e.key) {
					case 'Enter':
						if (!value) {
							setError('A file or folder name must be provided.')
							return
						}
						if (error) return

						if (inputRef.current?.value.trim()) {
							const newFile = { ...file, name: inputRef.current.value.trim() }

							if (editMode && file?.path) {
								setEditMode(false)
								onRename({
									oldPath: file?.path,
									newPath: file?.path.replace(new RegExp(`${file?.name}$`), newFile.name),
								})

								requestIdleCallback(() => {
									getExplorer()?.setAttribute('tabindex', '0')
									getExplorer()?.focus()
								})
							} else {
								onCreate(newFile)
							}
						}

						break
					case 'Escape':
						e.preventDefault()
						e.stopPropagation()

						if (editMode) {
							setEditMode(false)

							requestIdleCallback(() => {
								getExplorer()?.setAttribute('tabindex', '0')
								getExplorer()?.focus()
							})
						} else {
							onCreate(file)
						}
						break
					case 'ArrowRight':
					case 'ArrowLeft':
					case 'ArrowUp':
					case 'ArrowDown':
						e.stopPropagation()
						break
					default:
				}
			},
			[editMode, error, file, getExplorer, onCreate, onRename],
		)

		const handleNewEntry = useCallback(
			(type: string) => {
				node.select()
				onAddNew(type)
			},
			[node, onAddNew],
		)

		useEffect(() => {
			const remove = listenEvent(
				'keydown',
				(e: KeyboardEvent<Window>) => {
					const currentNode = node.isFocused || node.isSelected
					switch (e.key) {
						case 'F2':
						case 'Enter':
							if (currentNode && !isEditing) {
								e.stopPropagation()
								handleEdit()
							}
							break
						case 'Delete':
							if (currentNode && !isEditing) {
								e.stopPropagation()
								confirmDelete()
							}
							break
						default:
					}
				},
				document.querySelector('#file-explorer'),
			)

			return remove
		}, [confirmDelete, handleEdit, isEditing, node])

		const contextMenuClick = useCallback((e: ItemInfo<dxContextMenuItem>) => {
			if (!e.itemData?.items) {
				switch (e.itemData?.text) {
					case 'New file':
						handleNewEntry('file')
						break
					case 'New folder':
						handleNewEntry('folder')
						break
					case 'Edit':
						handleEdit()
						break
					case 'Delete':
						confirmDelete()
						break

					default:
						break
				}
			}
		}, [])

		useEffect(() => {
			const element = document.getElementById(node.data.id)
			if (element) setRenderContextMenu(true)
		}, [])

		if (file.type === 'file') {
			return (
				<div
					className={`h-full hover:cursor-pointer hover:bg-slate-800 ${node.isSelected ? 'bg-slate-800' : ''} ${isDropzoneActive ? '!bg-[unset]' : ''}`}
					style={style}
					ref={handleRef}
					onClick={() => {
						if (isEditing) return
						if (file?.type === 'file') onClick(node.data)
						node.toggle()
					}}
					onDoubleClick={() => {
						if (isEditing) return
						if (file?.type === 'file') onDoubleClick(node.data)
					}}
					id={node.data.id}
					onMouseUp={e => handleMouseUp}
				>
					<div className="parent show relative flex h-full w-full items-center ">
						<div className="flex h-5 w-5 items-center justify-center">
							{file?.isChanged && <FaCircle className="h-2 w-2" />}
							<span className={`hidden w-5`}>
								{node.isOpen ? (
									<FaChevronDown className="text-11" />
								) : (
									<FaChevronRight className="text-11" />
								)}
							</span>
						</div>
						<TreeIcon file={file} node={node} />
						{isEditing ? (
							<div
								className={'w-full'}
								data-error={''}
								onMouseDown={e => {
									e.stopPropagation()
								}}
								onClick={e => {
									e.stopPropagation()
								}}
							>
								<input
									ref={inputRef}
									spellCheck={false}
									className={'w-full border border-sky-600 bg-transparent pl-2 text-13 outline-none'}
									onBlur={handleBlur}
									onChange={handleChange}
									onKeyDown={handleKeyDown}
								/>
							</div>
						) : (
							<>
								<span className={'ml-[6px] line-clamp-1 flex-1 flex-shrink-0 text-13'}>
									{file?.name}
								</span>
								<div
									className={'child left-auto right-1 hidden items-center'}
									onClick={e => e.stopPropagation()}
								>
									{file?.name !== 'project' && (
										<div>
											<button
												title="Edit"
												className={'px-1 hover:text-white'}
												onClick={handleEdit}
											>
												<FaPen className="text-11" />
											</button>
											<button
												title="Delete"
												className={'px-1 hover:text-white'}
												onClick={confirmDelete}
											>
												<FaTrash className="text-11" />
											</button>
										</div>
									)}
								</div>
							</>
						)}
					</div>
					{renderContextMenu && (
						<ContextMenuMemo
							target={document.getElementById(node.data.id)}
							contextMenuClick={contextMenuClick}
							dataSource={[
								{ text: 'Edit', icon: 'edit' },
								{ text: 'Delete', icon: 'trash' },
							]}
						/>
					)}
				</div>
			)
		}

		return (
			<section className={`container`}>
				<div {...getRootProps({ className: `dropzone ${isDropzoneActive ? 'active' : ''}` })}>
					<div
						className={`h-full hover:cursor-pointer hover:bg-slate-800 ${node.isSelected ? 'bg-slate-800' : ''} ${isDropzoneActive ? '!bg-[unset]' : ''}`}
						style={style}
						ref={handleRef}
						onClick={() => {
							if (isEditing) return
							if (file?.type === 'file') onClick(node.data)
							node.toggle()
						}}
						onDoubleClick={() => {
							if (isEditing) return
							if (file?.type === 'file') onDoubleClick(node.data)
						}}
						id={node.data.id}
						onMouseUp={e => handleMouseUp}
					>
						<div className="parent show relative flex h-full w-full items-center ">
							<div className="flex h-5 w-5 items-center justify-center">
								{file?.isChanged && <FaCircle className="h-2 w-2" />}
								<span className={`w-5 ${file?.type !== 'folder' ? 'hidden' : ''}`}>
									{node.isOpen ? (
										<FaChevronDown className="text-11" />
									) : (
										<FaChevronRight className="text-11" />
									)}
								</span>
							</div>
							<TreeIcon file={file} node={node} />
							{isEditing ? (
								<div
									className={'w-full'}
									data-error={''}
									onMouseDown={e => {
										e.stopPropagation()
									}}
									onClick={e => {
										e.stopPropagation()
									}}
								>
									<input
										ref={inputRef}
										spellCheck={false}
										className={
											'w-full border border-sky-600 bg-transparent pl-2 text-13 outline-none'
										}
										onBlur={handleBlur}
										onChange={handleChange}
										onKeyDown={handleKeyDown}
									/>
								</div>
							) : (
								<>
									<span className={'ml-[6px] line-clamp-1 flex-1 flex-shrink-0 text-13'}>
										{file?.name}
									</span>
									<div
										className={'child left-auto right-1 hidden items-center'}
										onClick={e => e.stopPropagation()}
									>
										{file?.type === 'folder' && (
											<>
												<button
													title="New file..."
													className={'px-1 hover:text-white'}
													onClick={() => handleNewEntry('file')}
												>
													<FaFileCirclePlus className="text-11" />
												</button>
												<button
													title="New folder..."
													className={'px-1 hover:text-white'}
													onClick={() => handleNewEntry('folder')}
												>
													<FaFolderPlus className="text-11" />
												</button>
											</>
										)}

										{file?.name !== 'project' && (
											<>
												<button
													title="Edit"
													className={'px-1 hover:text-white'}
													onClick={handleEdit}
												>
													<FaPen className="text-11" />
												</button>
												<button
													title="Delete"
													className={'px-1 hover:text-white'}
													onClick={confirmDelete}
												>
													<FaTrash className="text-11" />
												</button>
											</>
										)}
									</div>
								</>
							)}
						</div>
						{renderContextMenu && (
							<ContextMenuMemo
								target={document.getElementById(node.data.id)}
								contextMenuClick={contextMenuClick}
								dataSource={
									file?.type === 'folder'
										? [
												{ text: 'New file', icon: 'doc' },
												{ text: 'New folder', icon: 'folder' },
												{ text: 'Edit', icon: 'edit' },
												{ text: 'Delete', icon: 'trash' },
											]
										: [
												{ text: 'Edit', icon: 'edit' },
												{ text: 'Delete', icon: 'trash' },
											]
								}
							/>
						)}
					</div>
				</div>
			</section>
		)
	}),
)

export const ContextMenuMemo = memo(function ContextMenuMemo({
	target,
	contextMenuClick,
	dataSource,
}: {
	target: HTMLElement | null
	contextMenuClick: (e: ItemInfo<dxContextMenuItem>) => void
	dataSource: dxContextMenuItem[]
}) {
	return (
		<ContextMenu dataSource={dataSource} target={target || undefined} width={200} onItemClick={contextMenuClick} />
	)
})
