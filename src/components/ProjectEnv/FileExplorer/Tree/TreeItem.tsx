import React, { ChangeEvent, KeyboardEvent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from 'react'
import { NodeApi, TreeApi } from 'react-arborist'
import { ContextMenu, ContextMenuItem, ContextMenuTrigger } from 'rctx-contextmenu'
import { FileDataType, FileTreeNomarlizedType } from '../../../../utils/types'
import { useProjectCodeStore } from '../../../../store/codeEditor/projects'
import TreeIcon from './TreeIcon'
import {
	FaChevronDown,
	FaChevronRight,
	FaCircle,
	FaFileCirclePlus,
	FaFolderPlus,
	FaPen,
	FaTrash,
} from 'react-icons/fa6'
import { listenEvent } from '../../../../utils/events'
import { toJS } from 'mobx'

export default memo(function TreeItem({
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
}: {
	node: NodeApi<FileTreeNomarlizedType>
	style: React.CSSProperties
	dragHandle: ((el: HTMLDivElement | null) => void) | undefined
	tree: TreeApi<FileTreeNomarlizedType>
	onRename: ({ newPath, oldPath }: { oldPath: string; newPath: string }) => void
	onCreate: (file: FileDataType) => void
	onAddNew: (type: string) => void
	onDelete: (data: FileTreeNomarlizedType) => void
	onClick: (data: FileTreeNomarlizedType) => void
	onDoubleClick: (data: FileTreeNomarlizedType) => void
}) {
	const projectCodeStore = useProjectCodeStore()
	const file = projectCodeStore.fileEntries[node.data.id]

	const [error, setError] = useState<string>('')
	const [editMode, setEditMode] = useState<boolean>(false)
	const isEditing = file?.isCreating || editMode

	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isEditing) {
			if (inputRef.current) inputRef.current.value = file.name

			requestIdleCallback(() => {
				if (!inputRef.current) return
				inputRef.current.focus()

				if (!editMode) return
				const extIdx = file.name.lastIndexOf('.')
				inputRef.current.setSelectionRange(0, extIdx === 0 ? file.name.length : extIdx)
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
		console.log(1111);
		const newFile = { ...file, name: inputRef.current?.value.trim() || '' }
		if (editMode) {
			setEditMode(false)
			!error &&
				file.path &&
				onRename({
					oldPath: file.path,
					newPath: file.path.replace(new RegExp(`${file.name}$`), newFile.name),
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
		if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
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

						if (editMode && file.path) {
							setEditMode(false)
							onRename({
								oldPath: file.path,
								newPath: file.path.replace(new RegExp(`${file.name}$`), newFile.name),
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

	const uniqueId = 'context-menu' + file.id

	return (
		<div
			className={`h-full hover:cursor-pointer hover:bg-slate-800 ${node.isSelected ? 'bg-slate-800' : ''}`}
			style={style}
			ref={handleRef}
			onClick={() => {
				if (isEditing) return
				if (file.type === 'file') onClick(node.data)
				node.toggle()
			}}
			onDoubleClick={() => {
				if (isEditing) return
				if (file.type === 'file') onDoubleClick(node.data)
			}}
			onMouseUp={e => handleMouseUp}
		>
			<ContextMenuTrigger
				className="flex items-center relative w-full h-full parent show "
				id={uniqueId}
				disable={isEditing}
			>
				{file.isChanged && <FaCircle />}
				<span className={`w-5 ${file.type !== 'folder' ? 'hidden' : ''}`}>
					{node.isOpen ? <FaChevronDown className="text-11" /> : <FaChevronRight className="text-11" />}
				</span>
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
							className={'bg-transparent outline-none border border-sky-600 pl-2 w-full text-13'}
							onBlur={handleBlur}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
						/>
					</div>
				) : (
					<>
						<span className={'flex-shrink-0 flex-1 text-13 line-clamp-1 ml-[6px]'}>{file.name}</span>
						<div
							className={'hidden items-center right-1 left-auto child'}
							onClick={e => e.stopPropagation()}
						>
							{file.type === 'folder' && (
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

							{file.name !== 'project' && (
								<>
									<button title="Edit" className={'px-1 hover:text-white'} onClick={handleEdit}>
										<FaPen className="text-11" />
									</button>
									<button title="Delete" className={'px-1 hover:text-white'} onClick={confirmDelete}>
										<FaTrash className="text-11" />
									</button>
								</>
							)}
						</div>
					</>
				)}
			</ContextMenuTrigger>

			<ContextMenu id={uniqueId} hideOnLeave={true} className="">
				<ContextMenuItem onClick={handleEdit}>Rename</ContextMenuItem>
				<ContextMenuItem onClick={() => requestIdleCallback(confirmDelete)}>Delete</ContextMenuItem>
			</ContextMenu>
		</div>
	)
})
