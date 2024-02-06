import { FSWatchOptions, IFSWatcher, BufferEncoding } from '@webcontainer/api'
import { observer } from 'mobx-react-lite'
import { memo, useEffect, useRef } from 'react'
import { monaco } from 'react-monaco-editor'
import { useWebContainer } from '../../contexts/WebContainer/hooks'
import projectService from '../../services/ProjectSerivce'
import webContainerService from '../../services/WebContainerService'
import { useProjectCodeStore } from '../../store/projects'
import { listenEvent, sendEvent } from '../../utils/events'
import { isMediaFile, uuidv4 } from '../../utils/strings'
import { FileDataType, FileTreeNomarlizedType, PackageDependencyType } from '../../utils/types'
import { IMAGE_EXTENSIONS } from '../../utils/constant'

let isFirst = true

const StartWebContainer = memo<{
	onFileCreated: (file: FileDataType, focusEditor?: boolean) => void
	onFileDeleted: (file: FileDataType) => void
}>(
	observer(function StartWebContainer({ onFileCreated, onFileDeleted }) {
		const { boot, webContainer } = useWebContainer()
		const {
			treeFiles,
			project,
			addEntry,
			addTreeFile,
			deleteTreeFile,
			deleteEntry,
			containerTreeFiles,
			addPackageDependency,
		} = useProjectCodeStore()
		const watchers = useRef<IFSWatcher[]>([])

		// Boot the web container
		useEffect(() => {
			if (!isFirst) return
			boot?.()
			isFirst = false
		}, [boot])

		useEffect(() => {
			const remove = listenEvent('resize', () => sendEvent('terminal-fit'), window)
			return remove
		}, [])

		// Mount the web container
		useEffect(() => {
			if (!webContainer || !containerTreeFiles) return

			const start = async () => {
				await webContainer.mount(containerTreeFiles)
				await webContainerService.startShell('terminal')
			}
			start()
		}, [webContainer, containerTreeFiles])

		useEffect(() => {
			const remove = listenEvent('terminal:ready', () => {
				project?.cmdStartup && webContainerService.writeCommand(`${project.cmdStartup}\n`, 'terminal')

				setTimeout(() => {
					sendEvent('terminal-fit')
				}, 1000)
			})
			return remove
		}, [project])

		const updateDependencies = async () => {
			const packageJson = projectService.getEntryFromPath('package.json')
			if (!packageJson) return

			const packageJsonContent = packageJson.model?.getValue() ?? ''
			const packageJsonParsed = JSON.parse(packageJsonContent)

			const dependencies = packageJsonParsed.dependencies ?? {}
			const devDependencies = packageJsonParsed.devDependencies ?? {}
			const allDependencies = Object.entries({ ...dependencies, ...devDependencies }).map(([name, version]) => ({
				name,
				version,
			})) as PackageDependencyType[]

			addPackageDependency(allDependencies)
		}

		useEffect(() => {
			updateDependencies()
		}, [])

		// Update dependencies when package.json changed
		useEffect(() => {
			const remove = listenEvent('dependencies:updated', updateDependencies)

			return remove
		}, [])

		// Sync files from container
		useEffect(() => {
			if (!webContainer || !treeFiles.length) return

			const syncFromContainer = async (filePath: string, type = 'file') => {
				const isFile = type === 'file'

				try {
					let encoding: BufferEncoding = 'utf-8'

					const newContent = isFile ? (await webContainerService.readFile(filePath, encoding)) ?? '' : null
					const entry = projectService.getEntryFromPath(filePath)
					// If file exists
					if (entry) {
						// Only update if content is different
						// This is to prevent cursor jumping
						if (isFile && entry?.model?.getValue() !== newContent) {
							entry?.model?.setValue(newContent || '')
						}
					}
					// If file not exists, create new file
					else {
						const isRoot = !filePath.includes('/') // If file is in root folder
						const fileName = filePath.split('/').pop()
						const parentPath = filePath.split('/').slice(0, -1).join('/') // Remove file name
						const parentEntry = projectService.getEntryFromPath(parentPath)
						if (!fileName) return
						const newEntry: FileDataType = {
							id: uuidv4(),
							project_id: project?.project_id || 0,
							parent_id: isRoot ? treeFiles?.[0].id : parentEntry.id,
							name: fileName || '',
							path: filePath,
							type: isFile ? 'file' : 'folder',
							content: newContent,
							isNew: true,
						}

						const newTreeFile: FileTreeNomarlizedType = {
							id: newEntry.id,
						}

						if (isFile) {
							newEntry.model = monaco.editor.createModel(
								newContent || '',
								undefined,
								monaco.Uri.file(filePath),
							)
						} else {
							newEntry.children = []
							newTreeFile.children = []
						}

						addEntry(newEntry)
						addTreeFile({
							parent_id: newEntry.parent_id || '',
							data: newTreeFile,
						})

						if (isFile && newEntry.name.toLowerCase().includes('dockerfile')) {
							requestIdleCallback(() => {
								onFileCreated(newEntry, true) // true is auto focus editor
							})
						} else {
							// sendEvent('tree:folder-created', newEntry)
						}
					}
				} catch (error: any) {
					const errorString = error.toString()
					if (errorString.includes('ENOENT')) {
						if (isFile) {
							const file = projectService.getEntryFromPath(filePath)
							if (file) {
								onFileDeleted(file)
							}
						}

						requestIdleCallback(() => {
							deleteTreeFile(filePath)
							deleteEntry(filePath)
						})
					} else {
						console.log(error)
					}
				}
			}

			// Watch file change and update editor
			const handle = (path: string) => async (event: string, fileName: string) => {
				setTimeout(async () => {
					const filePath = path + fileName

					// Ignore node_modules
					if (filePath.includes('node_modules') || filePath.includes('.nuxt') || filePath.includes('.next'))
						return

					try {
						const childrens = await webContainerService.getWebContainer().fs.readdir(filePath)

						await syncFromContainer(filePath, 'folder')

						// If file is folder, sync all files inside
						if (childrens.length) {
							for (const child of childrens) {
								await handle(filePath + '/')(event, child)
							}
						}
					} catch (error: any) {
						const errorString = error.toString()

						// Watch file change and update editor
						if (errorString.includes('ENOTDIR')) {
							await syncFromContainer(filePath)
						}
						// Watch file delete and update editor
						else if (errorString.includes('ENOENT')) {
							await syncFromContainer(filePath)
						} else {
							console.log(errorString)
						}

						// Update dependencies when package.json changed
						if (fileName === 'package.json') {
							sendEvent('dependencies:updated')
						}
					}
				}, 1000)
			}

			const _watchers = watchers.current

			// Watch root folder
			const rootWatcher = webContainerService.watchFile('/', handle('') as FSWatchOptions)
			if (rootWatcher) {
				_watchers.push(rootWatcher)
			}

			// Watch sub folders (except project folder)
			;(async function forEach(treeFiles) {
				for (const item of treeFiles) {
					const file = projectService.getEntryFromId(item.id)
					if (!file) continue
					if (file.type === 'folder' && file.path && file.path !== 'project' && !file.isCreating) {
						try {
							await webContainerService.getWebContainer().fs.readdir(file.path)
							const fileWatcher = webContainerService.watchFile(
								file.path,
								handle(file.path + '/') as FSWatchOptions,
							)
							fileWatcher && _watchers.push(fileWatcher)
						} catch (error) {
							// Ignore ENOTDIR error
						}
					}
					if (item.children) {
						forEach(item.children)
					}
				}
			})(treeFiles)

			return () => {
				for (const watcher of _watchers) {
					watcher.close()
				}
			}
		}, [onFileCreated, onFileDeleted, treeFiles, webContainer])

		return null
	}),
)

export default StartWebContainer
