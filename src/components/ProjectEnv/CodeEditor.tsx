'use client'

import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MoveHandler } from 'react-arborist'
import SplitPane, { Pane, SashContent } from 'split-pane-react'
import 'split-pane-react/esm/themes/default.css'
import 'xterm/css/xterm.css'
import editorService from '../../services/EditorService'
import projectService from '../../services/ProjectSerivce'
import webContainerService from '../../services/WebContainerService'
import { useProjectCodeStore } from '../../store/projects'
import { listenEvent, sendEvent } from '../../utils/events'
import { isMediaFile, uuidv4 } from '../../utils/strings'
import { FileDataType, FileTreeNomarlizedType } from '../../utils/types'
import Browser, { BrowserRef } from './Browser'
import Editor, { EditorNavRef } from './Editor'
import Navigation, { NavigationRef } from './Navigation'
import Sidebar, { SidebarRef } from './Sidebar'
import StartWebContainer from './StartWebContainer'
import Terminal, { TerminalRef } from './Terminal'
import { useSession } from 'next-auth/react'
import { useToastStore } from '../../store/ToastStore'
import { ToastVariant } from '../Toast'
import axios from 'axios'
import { isNonPermission, isPermissionEdit, isPermissionView } from '../../utils/permission'

export default observer(function CodeEditor({ projectId }: { projectId: string }) {
	const { data: session, status } = useSession()
	const [sizes, setSizes] = useState<(number | string)[]>([320, 'auto', 500])
	const [sizes1, setSizes1] = useState<(number | string)[]>(['auto', 320])
	const [code, setCode] = useState<string>('')
	const [isResizing, setIsStartResize] = useState(false)
	const projectCodeStore = useProjectCodeStore()
	const toastStore = useToastStore()
	const editorRef = useRef<EditorNavRef>(null)
	const terminalRef = useRef<TerminalRef>(null)
	const navigationRef = useRef<NavigationRef>(null)
	const [isOpenBrowser, setIsOpenBrowser] = useState(true)
	const [sizeBrowserBeforeClose, setSizeBrowserBeforeClose] = useState(500)
	// const { socket } = useSocket()

	const sidebarRef = useRef<SidebarRef>(null)
	const browserRef = useRef<BrowserRef>(null)

	const handleDragStarted = useCallback(() => setIsStartResize(true), [])

	const handleDragFinished = useCallback(() => setIsStartResize(false), [])

	useEffect(() => {
		document.title = `${projectCodeStore.project?.title} - Code Builder`
	}, [projectCodeStore])

	useEffect(() => {
		const remove = listenEvent(
			'keydown',
			async (e: KeyboardEvent) => {
				if (e.ctrlKey && e.key === 's') {
					e.preventDefault()
					e.stopPropagation()

					if (!session) {
						toastStore.add('error', {
							header: 'Error',
							content: 'You need to login to save project',
							variant: ToastVariant.Error,
						})
						return
					}

					const file = editorService.getCurrentFile()
					if (!file || isMediaFile(file.name)) return

					projectCodeStore.editEntry({
						...file,
						isChanged: false,
						content: file.contentUnsaved!,
						contentUnsaved: '',
					})
					webContainerService.writeFile(file.path, file.contentUnsaved)

					if (
						status === 'authenticated' &&
						isPermissionView(projectCodeStore.project?.permissions || [], session?.user?.id)
					) {
						toastStore.add('permission-viewer', {
							header: "Can't save",
							variant: ToastVariant.Error,
							autoHideTimeout: 5000,
							content: 'Your permission is viewer. You can fork project',
						})
						return
					}

					if (
						status === 'authenticated' &&
						session?.user?.id !== projectCodeStore.project?.uuid?._id &&
						isNonPermission(projectCodeStore.project?.permissions || [], session?.user?.id)
					) {
						const res = await navigationRef.current?.forkProject()
						res === true && (await navigationRef.current?.handleSaveProject())
						return
					}

					if (
						status === 'authenticated' &&
						(session?.user?.id === projectCodeStore.project?.uuid?._id ||
							isPermissionEdit(projectCodeStore.project?.permissions || [], session?.user?.id))
					) {
						await navigationRef.current?.handleSaveProject()
					}
				}
			},
			window,
		)

		return remove
	}, [projectCodeStore, session, status])

	useEffect(() => {
		const remove = listenEvent(
			'resize',
			() => {
				editorService.layout()
				sendEvent('terminal-fit')
			},
			window,
		)

		editorService.layout()
		sendEvent('terminal-fit')
		return remove
	}, [sizes1, sizes, isResizing])

	const autoLayout = useCallback(() => {
		editorService.layout()
		sendEvent('terminal-fit')
	}, [sizes1, sizes, isResizing])

	useEffect(() => {
		projectCodeStore.getOneProjectFromDB(projectId)
	}, [projectId])

	useEffect(() => {
		autoLayout()
	}, [editorService._currentFile])

	const handlePreviewFile = useCallback((file: FileTreeNomarlizedType, focusEditor = false) => {
		editorRef.current?.navRef?.previewFile({ file, focusEditor })
	}, [])

	const handleFileDeleted = useCallback((file: FileTreeNomarlizedType) => {
		editorRef.current?.navRef?.closeFile(file)
	}, [])

	const onChange = useCallback(() => {
		const file = editorService.getCurrentFile()

		// navbarRef.current.setDisabledSaveBtn(false)
		file && projectCodeStore.editEntry({ ...file, isChanged: true })
	}, [])

	const onRename = useCallback(async ({ oldPath, newPath }: { oldPath: string; newPath: string }) => {
		// Create folder if not exists
		const newFolder = newPath.split('/').slice(0, -1).join('/')
		newFolder && (await webContainerService.runCommand('mkdir', ['-p', newFolder]))

		// Wait for folder to be created
		setTimeout(
			() => {
				webContainerService.runCommand('mv', [oldPath, newPath])
			},
			newFolder.split('/').length * 50,
		)
	}, [])

	const onMove: MoveHandler<FileTreeNomarlizedType> = useCallback(async data => {
		const parentEntry = projectService.getEntryFromId(data.parentId || '')
		if (!parentEntry) return

		const mvCommands = data.dragNodes.map(node => {
			const file = projectService.getEntryFromId(node.id)
			const newPath = `${parentEntry.path}/${file.name}`
			const hasRoot = newPath.startsWith('project/')
			if (hasRoot) {
				return `mv ${file.path} ${newPath.replace('project/', '')}`
			} else {
				return `mv ${file.path} ${newPath}`
			}
		})

		for (const command of mvCommands) {
			await webContainerService.runCommand('mv', command.split(' ').slice(1))
		}
	}, [])

	const onCreate = useCallback((file: FileDataType) => {
		const parent = projectService.getEntryFromId(file.parent_id || '')
		if (!parent) return
		// @ts-ignore
		projectCodeStore.deleteTreeFile(file.path || file.id)
		projectCodeStore.deleteEntry(file.id)

		requestIdleCallback(async () => {
			if (file.name) {
				let newPath = `${parent.path}/${file.name}`
				const hasRoot = newPath.startsWith('project/')
				if (hasRoot) {
					newPath = newPath.replace('project/', '')
				}

				if (file.type === 'folder') {
					await webContainerService.runCommand('mkdir', ['-p', newPath])
				} else {
					// Create folder if not exists
					const newFolder = newPath.split('/').slice(0, -1).join('/')
					newFolder && (await webContainerService.runCommand('mkdir', ['-p', newFolder]))

					// Wait for folder to be created
					setTimeout(
						() => {
							webContainerService.runCommand('touch', [newPath])
						},
						newFolder.split('/').length * 50,
					)
				}
			}
		})
	}, [])

	const onAddNew = (type: string) => {
		const isFile = type === 'file'

		let node = sidebarRef.current?.fileExplorerRef?.getMostRecentNode()

		const file = projectService.getEntryFromId(node ? node.id : projectService.getEntryFromId('project').id)
		if (!file) return

		const parent = file.type === 'folder' ? file : projectService.getEntryFromId(file.parent_id || '')

		if (!parent) return

		const newEntry: FileDataType = {
			id: uuidv4(),
			project_id: projectCodeStore.project?.project_id || 0,
			parent_id: parent.id,
			name: '',
			path: '',
			type,
			content: '',
			isNew: true,
			isCreating: true,
		}
		const newTreeFile = {
			id: newEntry.id,
			children: [],
		}

		if (isFile) {
			newEntry.model = undefined
		} else {
			newEntry.children = []
			newTreeFile.children = []
		}

		projectCodeStore.addEntry(newEntry)
		projectCodeStore.addTreeFile({
			parent_id: newEntry.parent_id || '',
			data: newTreeFile,
		})

		// Open the new file in the file explorer
		requestIdleCallback(() => {
			sidebarRef.current?.fileExplorerRef?.select(newEntry.id)
			sidebarRef.current?.fileExplorerRef?.scrollTo(newEntry.id)
		})
	}

	const onDelete = useCallback((file: FileDataType) => {
		file?.path && webContainerService.runCommand('rm', ['-rf', file.path])
	}, [])

	const onClick = useCallback((file: FileTreeNomarlizedType) => {
		editorRef.current?.navRef?.previewFile({ file, focusEditor: false })
	}, [])

	const onDoubleClick = useCallback((file: FileTreeNomarlizedType) => {
		editorRef.current?.navRef?.openFile(file)
	}, [])

	const createTerminal = useCallback(async (_id?: string) => {
		terminalRef.current?.createTerminal(_id)
	}, [])

	const openTerminal = useCallback(async (_id: string) => {
		terminalRef.current?.openTerminal(_id)
	}, [])

	// useEffect(() => {
	// 	const remove = listenEvent('tree:folder-created', ({ detail: entry }: { detail: FileTreeNomarlizedType }) => {
	// 		// Open the new folder in the file explorer
	// 		requestIdleCallback(() => {
	// 			sidebarRef.current?.fileExplorerRef?.select(entry.id)
	// 			sidebarRef.current?.fileExplorerRef?.scrollTo(entry.id)
	// 		})
	// 	})

	// 	return remove
	// }, [])

	const handleHiddenTerminal = useCallback(() => {
		setSizes1(['auto', 0])
	}, [])

	const openNewTab = useCallback(() => {
		browserRef.current?.openNewTab()
	}, [])

	const toggleBrowser = useCallback(() => {
		setIsOpenBrowser(prev => {
			const flag = !prev
			if (flag === true) setSizes([320, 'auto', sizeBrowserBeforeClose])
			else setSizes([sizes[0], 'auto', 0])

			return flag
		})
	}, [isOpenBrowser])

	return (
		<>
			<div className="flex h-screen flex-col text-desc">
				<Navigation
					ref={navigationRef}
					onPreview={onClick}
					openNewTab={openNewTab}
					toggleBrowser={toggleBrowser}
					isOpenBrowser={isOpenBrowser}
				/>
				<SplitPane
					sashRender={(i, boolean) => (
						<SashContent className="w-0.5 bg-neutral-800 hover:bg-indigo-600 focus:bg-indigo-600 active:bg-indigo-600" />
					)}
					split="vertical"
					sizes={sizes}
					onChange={sizes => {
						autoLayout()
						setSizes(sizes)
						setSizeBrowserBeforeClose(sizes[2])
						sendEvent('terminal-fit')
					}}
					onDragStart={handleDragStarted}
					onDragEnd={handleDragFinished}
				>
					<Pane minSize={100} className="h-full w-full bg-zinc-900">
						<Sidebar
							ref={sidebarRef}
							onAddNew={onAddNew}
							onClick={onClick}
							onCreate={onCreate}
							onDelete={onDelete}
							onDoubleClick={onDoubleClick}
							onMove={onMove}
							onRename={onRename}
							openTerminal={openTerminal}
							createTerminal={createTerminal}
						/>
					</Pane>
					<SplitPane
						sashRender={(i, boolean) => (
							<SashContent className="h-0.5 bg-neutral-800 hover:bg-indigo-600 focus:bg-indigo-600 active:bg-indigo-600" />
						)}
						sizes={sizes1}
						split="horizontal"
						onChange={sizes => {
							autoLayout()
							setSizes1(sizes)
							sendEvent('terminal-fit')
						}}
						onDragStart={handleDragStarted}
						onDragEnd={handleDragFinished}
					>
						<Pane minSize={0} className="flex h-full items-center justify-center">
							<div className="flex h-full w-full flex-col bg-zinc-900">
								<Editor ref={editorRef} onChange={onChange} />
							</div>
						</Pane>
						<div className="flex h-full items-center justify-center">
							<Pane minSize={100} className="h-full w-full bg-zinc-900">
								<Terminal ref={terminalRef} handleHidden={handleHiddenTerminal} />
							</Pane>
						</div>
					</SplitPane>
					<div className="flex h-full items-center justify-center">
						<Pane minSize={100} className="h-full w-full bg-zinc-900">
							{isOpenBrowser && <Browser isResizing={isResizing} ref={browserRef} />}
						</Pane>
					</div>
				</SplitPane>
			</div>
			{projectCodeStore.project && (
				<StartWebContainer onFileCreated={handlePreviewFile} onFileDeleted={handleFileDeleted} />
			)}
		</>
	)
})
