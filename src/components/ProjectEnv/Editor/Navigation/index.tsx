import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ReactSortable } from 'react-sortablejs'
import editorService from '../../../../services/EditorService'
import projectService from '../../../../services/ProjectSerivce'
import { sendEvent } from '../../../../utils/events'
import { FileTreeNomarlizedType } from '../../../../utils/types'
import Scrollbar from '../../../Scrollbar'
import NavigationItem from './NavigationItem'
import { IMAGE_EXTENSIONS } from '../../../../utils/constant'
import { isMediaFile } from '../../../../utils/strings'

export type EditorRef = {
	openFile: (file: FileTreeNomarlizedType) => void
	previewFile: ({ file, focusEditor }: { file: FileTreeNomarlizedType; focusEditor: boolean }) => void
	closeFile(file: FileTreeNomarlizedType): void
}

export default forwardRef<EditorRef>(function Navigation({}, ref) {
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
						sendEvent('updateLanguage')
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
				sendEvent('updateLanguage')
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

	// Handle tab change
	useEffect(() => {
		if (!currentTab) return

		const _viewState = viewState.current
		const file = projectService.getEntryFromId(currentTab.id)

		if (!file || !file?.model) return

		editorService.setCurrentFile(file)

		if (isMediaFile(file.name)) {
			sendEvent('openImageEditor')
			return
		}

		sendEvent('closeImageEditor')
		editorService.getEditor()?.setModel(file.model)
		sendEvent('updateLanguage')

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

	// Handle close all tabs
	const handleCloseAll = useCallback(() => {
		setTabs([])
		editorService.getEditor()?.setModel(null)
		sendEvent('updateLanguage')
		editorService.setCurrentFile(null)
	}, [])

	// Handle close others tabs
	const handleCloseOthers = useCallback((tab: FileTreeNomarlizedType) => {
		setTabs([tab])
	}, [])

	useEffect(() => {
		if (!currentTab) return
		sendEvent('tree:file-change', currentTab)
	}, [currentTab])

	return (
		<Scrollbar className="!h-[40px]">
			<ReactSortable
				tag="ul"
				className="flex h-[40px] flex-shrink-0 bg-[#202327] marker:not-sr-only"
				list={tabs}
				setList={setTabs}
			>
				{tabs.map(tab => (
					<NavigationItem
						data={tab}
						isPreview={!!tab.isPreview}
						active={currentTab?.id === tab.id}
						key={tab.id}
						onMouseDown={handleSwitchTab}
						onDoubleClick={handleOpen}
						onClose={handleClose}
						onCloseOthers={handleCloseOthers}
						onCloseAll={handleCloseAll}
					/>
				))}
			</ReactSortable>
		</Scrollbar>
	)
})
