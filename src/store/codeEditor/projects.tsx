'use client'

import { FileSystemTree } from '@webcontainer/api'
import { makeAutoObservable } from 'mobx'
import { getStore, InitialStoreState, Store, useStore } from '.'
import projectService from '../../services/ProjectSerivce'
import { FileDataType, FileEntriesType, FileTreeNomarlizedType, ProjectDataType } from '../../utils/types'
import axios from 'axios'
import { convertContainerFiles, createFileEntries, createFileModels, streeNormalize } from '../../utils/trees'

let firstTime = true

export class ProjectCodeStore {
	store: Store
	project: ProjectDataType | null = null
	fileEntries: FileEntriesType = {}
	treeFiles: FileTreeNomarlizedType[] = []
	containerTreeFiles: FileSystemTree = {}
	treeFilesUpdateCount: number = 0

	constructor(store: Store, initialState?: InitialStoreState<ProjectCodeStore>) {
		this.store = store

		initialState &&
			Object.keys(initialState).forEach(key => {
				const keyId = key as keyof InitialStoreState<ProjectCodeStore>
				const value = initialState[keyId]
				if (value !== undefined) {
					// @ts-ignore Have to prevent readonly properties
					this[keyId] = value
				}
			})

		makeAutoObservable(this, {}, { autoBind: true })
	}

	*init() {}

	setOneProject(project: ProjectDataType) {
		this.project = project
	}

	async getOneProjectFromDB(id: string) {
		const { data } = await axios.get<ProjectDataType>('/api')

		if (firstTime) {
			firstTime = false

			const fileModels = createFileModels(data.files)
			const fileEntries = createFileEntries(fileModels)

			this.setFileEntries(fileEntries)
			this.setTreeFiles(streeNormalize(fileModels))
			this.setContainerTreeFiles(convertContainerFiles(data.files))

			projectService.setCurrentProject(data)
			projectService.setFileEntries(fileEntries)
		}

		this.setOneProject(data)
	}

	// File entries
	setFileEntries(fileEntries: FileEntriesType) {
		this.fileEntries = fileEntries
		projectService.setFileEntries(fileEntries)
	}
	addEntry(entry: FileDataType) {
		const newFileEntries = {
			...this.fileEntries,
			[entry.id]: entry,
			...(entry.path !== null && entry.path !== undefined && { [entry.path]: entry }),
		}

		this.fileEntries = newFileEntries
		projectService.setFileEntries(newFileEntries)
	}
	editEntry(file: FileDataType) {
		const newFileEntries = { ...this.fileEntries }
		const entry = projectService.getEntryFromId(file.id)
		if (entry) {
			newFileEntries[entry.id] = { ...entry, ...file }
			entry.path && (newFileEntries[entry.path] = { ...entry, ...file })
		}

		this.fileEntries = newFileEntries
		projectService.setFileEntries(newFileEntries)
	}
	removeAllChangedState() {
		const newFileEntries = { ...this.fileEntries }
		Object.values(newFileEntries).forEach(fileEntry => {
			if (fileEntry.isChanged) {
				fileEntry.isChanged = false
			}
		})

		this.fileEntries = newFileEntries
		projectService.setFileEntries(newFileEntries)
	}
	deleteEntry(idOrPath: string) {
		const newFileEntries = { ...this.fileEntries }
		const entry = projectService.getEntryFromId(idOrPath) ?? projectService.getEntryFromPath(idOrPath)
		if (entry) {
			// Delete entry
			delete newFileEntries?.[entry.id]
			entry.path && delete newFileEntries?.[entry.path]

			// Delete sub entries
			if (entry.type === 'folder') {
				Object.values(newFileEntries).forEach(fileEntry => {
					const isSubEntry = fileEntry?.path?.startsWith(entry.path + '/')
					if (isSubEntry) {
						delete newFileEntries?.[fileEntry.id]
						fileEntry?.path && delete newFileEntries?.[fileEntry.path]

						fileEntry.model?.dispose()
					}
				})
			} else {
				entry.model?.dispose()
			}
		}

		this.fileEntries = newFileEntries
		projectService.setFileEntries(newFileEntries)
	}

	// Tree files
	setTreeFiles(treeFiles: FileTreeNomarlizedType[]) {
		this.treeFiles = treeFiles
		this.treeFilesUpdateCount++
	}
	addTreeFile(treeFile: { parent_id: string; data: FileTreeNomarlizedType }) {
		// Add new file to tree
		const { parent_id, data } = treeFile

		const handle = (treeFiles: FileTreeNomarlizedType[]) => {
			for (let node of treeFiles) {
				if (node.id === parent_id) {
					node.children = [...(node.children ? node.children : []), data]
					break
				}
				if (node.children) {
					handle(node.children)
				}
			}
		}

		handle(this.treeFiles)

		this.treeFiles = [...this.treeFiles]
		this.treeFilesUpdateCount++
	}
	deleteTreeFile(filePath: string) {
		const entry = projectService.getEntryFromPath(filePath)
		if (!entry) return

		const handle = (treeFiles: FileTreeNomarlizedType[]) => {
			for (let node of treeFiles) {
				if (node.id === entry.parent_id) {
					node.children = node?.children?.filter(child => child.id !== entry.id)
					break
				}
				if (node.children) {
					handle(node.children)
				}
			}
		}

		handle(this.treeFiles)

		this.treeFiles = [...this.treeFiles]
		this.treeFilesUpdateCount++
	}

	// Container tree files
	setContainerTreeFiles(containerTreeFiles: FileSystemTree) {
		this.containerTreeFiles = containerTreeFiles
	}

	// Force tree re-render
	forceTreeUpdate() {
		this.treeFilesUpdateCount++
	}
}

export const useProjectCodeStore = () => {
	return useStore().projects
}

export const getProjectCodeStore = () => {
	return getStore().projects
}
