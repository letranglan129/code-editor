'use client'

import * as monacoHelpers from '@/utils/monacoHelpers'
import { observer } from 'mobx-react-lite'
import { MonacoJsxSyntaxHighlight } from 'monaco-jsx-syntax-highlight'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MoveHandler, Tree } from 'react-arborist'
import { FaEye } from 'react-icons/fa'
import { FaCodeFork, FaFileCirclePlus, FaFolderPlus } from 'react-icons/fa6'
import MonacoEditor, { monaco } from 'react-monaco-editor'
import SplitPane, { Pane, SashContent } from 'split-pane-react'
import 'split-pane-react/esm/themes/default.css'
import 'xterm/css/xterm.css'
import editorService from '../../services/EditorService'
import { useProjectCodeStore } from '../../store/codeEditor/projects'
import { listenEvent, sendEvent } from '../../utils/events'
import Accordion from '../Accordion'
import Browser from './Browser'
import StartWebContainer from './StartWebContainer'
import Terminal from './Terminal'
import { createFileEntries, createFileModels } from '../../utils/trees'
import FileExplorer, { FileExplorerRefType } from './FileExplorer'
import Editor, { EditorNavRefType } from './Editor'
import { FileDataType, FileTreeNomarlizedType } from '../../utils/types'
import { toJS } from 'mobx'
import projectService from '../../services/ProjectSerivce'
import Navigation, { EditorRefType } from './Editor/Navigation'
import webContainerService from '../../services/WebContainerService'
import { uuidv4 } from '../../utils/strings'

monaco.editor.defineTheme('my-dark', {
	base: 'vs-dark',
	inherit: true,
	rules: [],
	colors: {
		'editor.background': '#15181e',
	},
})

const packages = [
	{
		name: 'react',
		version: '18.0.2',
	},
	{
		name: 'react-dom',
		version: '18.0.2',
	},
]

export default observer(function CodeEditor() {
	const [sizes, setSizes] = useState<(number | string)[]>([320, 500, 'auto'])
	const [sizes1, setSizes1] = useState<(number | string)[]>(['auto', 320])
	const [code, setCode] = useState<string>('')
	const [isResizing, setIsStartResize] = useState(false)
	const projectCodeStore = useProjectCodeStore()
	const editorRef = useRef<EditorNavRefType>(null)

	const fileExplorerRef = useRef<FileExplorerRefType>(null)

	const handleDragStarted = useCallback(() => setIsStartResize(true), [])

	const handleDragFinished = useCallback(() => setIsStartResize(false), [])

	useEffect(() => {
		const remove = listenEvent(
			'resize',
			() => {
				editorService.layout()
				sendEvent('terminal-fit')
			},
			window,
		)
		return remove
	}, [])

	const autoLayout = useCallback(() => {
		editorService.layout()
		sendEvent('terminal-fit')
	}, [])

	useEffect(() => {
		projectCodeStore.getOneProjectFromDB('')
	}, [])

	useEffect(() => {
		autoLayout()
	}, [editorService._currentFile])

	useEffect(() => {
		if (projectCodeStore.project) {
			// const listener = monacoHelpers.receiveFromJSXWorker()
		}
	}, [])

	const handlePreviewFile = useCallback((file: FileTreeNomarlizedType, focusEditor = false) => {
		editorRef.current?.navRef?.previewFile({ file, focusEditor })
	}, [])

	const handleFileDeleted = useCallback((file: FileTreeNomarlizedType) => {
		editorRef.current?.navRef?.closeFile(file)
	}, [])

	const onChange = () => {
		const file = editorService.getCurrentFile()
		// navbarRef.current.setDisabledSaveBtn(false)

		file && !file.isChanged && projectCodeStore.editEntry({ ...file, isChanged: true })
	}

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

	const onMove: MoveHandler<FileTreeNomarlizedType> = async data => {
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
	}
	const onCreate = (file: FileDataType) => {
		const parent = projectService.getEntryFromId(file.parent_id || '')
		if (!parent) return
		// @ts-ignore
		projectCodeStore.deleteTreeFile(file.path)
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
	}
	const onAddNew = (type: string) => {
		const isFile = type === 'file'

		const node = fileExplorerRef.current?.mostRecentNode
		if (!node) return

		const file = projectService.getEntryFromId(node.id)
		if (!file) return

		const parent = file.type === 'folder' ? file : projectService.getEntryFromId(file.parent_id || '')

		if (!parent) return

		const newEntry: FileDataType = {
			id: uuidv4(),
			project_id: projectCodeStore.project?.id || 0,
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
			fileExplorerRef.current?.select(newEntry.id)
			fileExplorerRef.current?.scrollTo(newEntry.id)
		})
	}
	const onDelete = () => {}

	const onClick = (file: FileTreeNomarlizedType) => {
		editorRef.current?.navRef?.previewFile({ file, focusEditor: false })
	}
	const onDoubleClick = (file: FileTreeNomarlizedType) => {
		editorRef.current?.navRef?.openFile(file)
	}

	useEffect(() => {
		const remove = listenEvent('tree:folder-created', ({ detail: entry }: { detail: FileTreeNomarlizedType }) => {
			// Open the new folder in the file explorer
			requestIdleCallback(() => {
				fileExplorerRef.current?.select(entry.id)
				fileExplorerRef.current?.scrollTo(entry.id)
			})
		})

		return remove
	}, [])

	return (
		<>
			<div className="h-screen text-desc">
				<SplitPane
					sashRender={(i, boolean) => <SashContent className="bg-red-700" />}
					split="vertical"
					sizes={sizes}
					onChange={sizes => {
						autoLayout()
						setSizes(sizes)
						sendEvent('terminal-fit')
					}}
					onDragStart={handleDragStarted}
					onDragEnd={handleDragFinished}
				>
					<Pane minSize={100} maxSize={320} className="bg-zinc-900 h-full w-full">
						<div className="bg-zinc-900">
							<div>
								<h2 className="text-11 pl-3 pr-2 h-10 items-center flex">PROJECT</h2>
								<Accordion
									className="bg-zinc-700"
									sticky
									open
									handler={<h6 className="text-11">INFO</h6>}
									iconPosition="left"
								>
									<div className="py-3 px-4">
										<h3 className="text-title text-13">Vitejs - Vite</h3>
										<p className="text-12 my-3">
											Next generation frontend tooling. It&apos;s fast!
										</p>
										<div className="flex gap-2 text-12">
											<div>
												<FaEye className="inline-block" /> 0 view
											</div>
											<div>
												<FaCodeFork className="inline-block" /> 0 fork
											</div>
										</div>
									</div>
								</Accordion>
								<Accordion
									className="bg-zinc-700"
									sticky
									open
									handler={
										<div className="flex justify-between items-center pr-3">
											<h6 className="text-11">FILES</h6>
											<div className="flex gap-2">
												<a
													onClick={e => {
														e.stopPropagation()
														onAddNew('file')
													}}
													className="hover:text-zinc-200"
												>
													<FaFileCirclePlus />
												</a>
												<a
													onClick={e => {
														e.stopPropagation()
														onAddNew('folder')
													}}
													className="hover:text-zinc-200"
												>
													<FaFolderPlus />
												</a>
											</div>
										</div>
									}
									iconPosition="left"
								>
									<FileExplorer
										onAddNew={onAddNew}
										onClick={onClick}
										onCreate={onCreate}
										onDelete={onDelete}
										onDoubleClick={onDoubleClick}
										onRename={onRename}
										ref={fileExplorerRef}
										key={projectCodeStore.treeFilesUpdateCount}
										onMove={onMove}
									/>
								</Accordion>
								<Accordion
									className="bg-zinc-700"
									sticky
									open
									handler={<h6 className="text-11">DEPENDENCIES</h6>}
									iconPosition="left"
								>
									<div className="py-3 px-4">
										{packages.map((pkg, i) => (
											<div key={i} className="py-2 px-3 flex items-center justify-between">
												<h3 className="text-title text-12 font-normal">{pkg.name}</h3>
												<p className="text-12">{pkg.version}</p>
											</div>
										))}
										<input
											type="text"
											className="w-full bg-zinc-800 px-3 outline-none border border-transparent text-12 h-7 focus:border-blue-500"
											placeholder="Enter package name"
										/>
									</div>
								</Accordion>
							</div>
						</div>
					</Pane>
					<SplitPane
						sashRender={(i, boolean) => <SashContent className="bg-red-700" />}
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
						<Pane minSize={0} className="h-full flex items-center justify-center">
							<div className="bg-zinc-900 flex flex-col h-full w-full">
								<Editor ref={editorRef} onChange={onChange} />
							</div>
						</Pane>
						<div className="h-full flex items-center justify-center">
							<Pane minSize={100} className="bg-zinc-900  h-full w-full">
								<Terminal />
							</Pane>
						</div>
					</SplitPane>
					<div className="h-full flex items-center justify-center">
						<Pane minSize={100} className="bg-zinc-900 w-full h-full">
							<Browser isResizing={isResizing} />
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
