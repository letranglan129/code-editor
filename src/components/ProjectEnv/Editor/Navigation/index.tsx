import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FileTreeNomarlizedType } from '../../../../utils/types'
import NavigationItem from './NavigationItem'
import editorService from '../../../../services/EditorService'
import projectService from '../../../../services/ProjectSerivce'
import * as monacoHelpers from '../../../../utils/monacoHelpers'
import { sendEvent } from '../../../../utils/events'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

export type EditorRefType = {
	openFile: (file: FileTreeNomarlizedType) => void
	previewFile: ({ file, focusEditor }: { file: FileTreeNomarlizedType; focusEditor: boolean }) => void
	closeFile(file: FileTreeNomarlizedType): void
}

export default forwardRef<EditorRefType>(function Navigation({}, ref) {
	const [tabs, setTabs] = useState<FileTreeNomarlizedType[]>([])
	const [currentTab, setCurrentTab] = useState<FileTreeNomarlizedType>()
	const autoFocusEditor = useRef<boolean>(false)
	const viewState = useRef<{ [key: string]: any }>({})

	const checkFileOpened = useCallback(
		(file: FileTreeNomarlizedType) => {
			return tabs.some(tab => !tab.isPreview && tab.id === file.id)
		},
		[tabs],
	)

	const handleOpen = useCallback((file: FileTreeNomarlizedType) => {
		setTabs(prev => {
			const preview = prev.find(item => item.isPreview)
			if (preview?.id === file.id) {
				preview.isPreview = false
				return [...prev]
			}
			return prev
		})
	}, [])

	const handleSwitchTab = useCallback((tab: FileTreeNomarlizedType) => {
		setCurrentTab(tab)
		autoFocusEditor.current = true
	}, [])

	const handlePreview = useCallback(
		({ file, focusEditor = false }: { file: FileTreeNomarlizedType; focusEditor: boolean }) => {
			autoFocusEditor.current = focusEditor
			const newFile = {
				...file,
				isPreview: file.isPreview ?? true,
			}

			// Set current file
			setCurrentTab(newFile)

			// Check if the file is already open
			const isOpened = checkFileOpened(file)
			if (isOpened) return

			// Add new file
			setTabs(prev => {
				const previewIdx = prev.findIndex(item => item.isPreview)
				if (previewIdx !== -1) {
					const copy = [...prev]
					copy.splice(previewIdx, 1, newFile)
					return copy
				}
				return [...prev, newFile]
			})
		},
		[checkFileOpened],
	)

	// Handles closing files on the navbar.
	const handleClose = useCallback(
		(tab: FileTreeNomarlizedType) => {
			setTabs(prev => {
				const restTabs = prev.filter(item => item.id !== tab.id)

				// If closed tab is current tab, switch to last tab
				if (currentTab?.id === tab.id) {
					const lastTab = restTabs[restTabs.length - 1]
					if (lastTab) {
						setCurrentTab(lastTab)
					} else {
						editorService?.getEditor()?.setModel(null)
						editorService.setCurrentFile(null)
					}
				}

				return restTabs
			})
		},
		[currentTab],
	)

	// Handles opening files on the navbar on startup.
	const handleStartUp = useCallback((pathNames: string[]) => {
		const filesResult = pathNames
			.map((pathName: string) => projectService.getEntryFromPath(pathName))
			.filter(file => file)

		if (filesResult.length) {
			requestIdleCallback(() => {
				const lastFile = filesResult[filesResult.length - 1]

				setCurrentTab({ id: lastFile.id, isPreview: false })
				setTabs(prev => [...prev, ...filesResult.map(file => ({ id: file.id, isPreview: false }))])

				lastFile?.model && editorService.getEditor()?.setModel(lastFile.model)
				editorService.setCurrentFile(lastFile)
			})
		}
	}, [])

	useImperativeHandle(
		ref,
		() => ({
			openFile: (file: FileTreeNomarlizedType) => {
				handleOpen(file)
			},
			previewFile: ({ file, focusEditor }: { file: FileTreeNomarlizedType; focusEditor: boolean }) => {
				handlePreview({ file, focusEditor })
			},
			closeFile(file: FileTreeNomarlizedType) {
				handleClose(file)
			},
		}),
		[handleOpen, handlePreview, handleClose],
	)

	useEffect(() => {
		if (!currentTab) return
		const file = projectService.getEntryFromId(currentTab.id)

		if (!file) return

		const listener = monacoHelpers.receiveFromJSXWorker({
			id: file.path,
			getModel: () => file.model,
		})

		// Send code to JSX worker
		const payload = monacoHelpers.createJSXWorkerPayload(file.path, file)
		monacoHelpers.sendToJSXWorker(payload)

		return () => listener.removeListener()
	}, [currentTab])

	// Handle tab change
	useEffect(() => {
		if (!currentTab) return

		const _viewState = viewState.current
		const file = projectService.getEntryFromId(currentTab.id)

		if (!file || !file?.model) return

		editorService.setCurrentFile(file)
		editorService.getEditor()?.setModel(file.model)

		// Restore viewState
		if (_viewState[file.id]) {
			editorService.getEditor()?.restoreViewState(_viewState[file.id])
		}

		requestIdleCallback(() => {
			if (autoFocusEditor.current) {
				editorService.getEditor()?.focus()
				autoFocusEditor.current = false
			}
		})

		return () => {
			// Save viewState
			_viewState[file.id] = editorService.getEditor()?.saveViewState()
		}
	}, [currentTab])

	useEffect(() => {
		if (!currentTab) return
		sendEvent('tree:file-change', currentTab)
	}, [currentTab])

	return (
		<OverlayScrollbarsComponent
			options={{
				scrollbars: {
					autoHide: 'leave',
				},
			}}
			className="flex-shrink-0 navigation-scrollbar"
			defer
		>
			<ul className="flex marker:not-sr-only h-[40px] bg-[#202327] flex-shrink-0">
				{tabs.map(tab => (
					<NavigationItem
						data={tab}
						isPreview={!!tab.isPreview}
						active={currentTab?.id === tab.id}
						key={tab.id}
						onMouseDown={handleSwitchTab}
						onDoubleClick={handleOpen}
						onClose={handleClose}
						// onCloseOthers={handleCloseOthers}
						// onCloseAll={handleCloseAll}
					/>
				))}
			</ul>
		</OverlayScrollbarsComponent>
	)
})
