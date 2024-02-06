'use client'

import { FileSystemTree } from '@webcontainer/api'
import { makeAutoObservable } from 'mobx'
import { getStore, InitialStoreState, Store, useStore } from './codeProvider'
import projectService from '../services/ProjectSerivce'
import {
	FileDataType,
	FileEntriesType,
	FileTreeNomarlizedType,
	PackageDependencyType,
	PermissionProjectType,
	ProjectDataType,
} from '../utils/types'
import axios from 'axios'
import { convertContainerFiles, createFileEntries, createFileModels, treeNormalize } from '../utils/trees'
import _ from 'lodash'

let firstTime = true

export class ProjectCodeStore {
	store: Store
	project: ProjectDataType | null = null
	fileEntries: FileEntriesType = {}
	treeFiles: FileTreeNomarlizedType[] = []
	containerTreeFiles: FileSystemTree = {}
	treeFilesUpdateCount: number = 0
	packageDependencies: PackageDependencyType[] = []
	slugTmp: string = ''

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
		this.slugTmp = project.slug || ''
	}

	async setTitle(title: string) {
		if (this.project) {
			this.project.title = title
		}
	}
	async setDesc(desc: string) {
		if (this.project) {
			this.project.description = desc
		}
	}

	async setSlug(slug: string) {
		this.slugTmp = slug
	}

	async setPublishUrl(url: string | null) {
		if (this.project) {
			this.project.publishUrl = url || undefined
		}
	}

	async setPermissions(permissions: PermissionProjectType[]) {
		if (this.project) {
			this.project.permissions = permissions
		}
	}

	async getOneProjectFromDB(id: string) {
		const { data } = await axios.get<ProjectDataType>(`/api/projects/${id}`)

		if (firstTime) {
			firstTime = false

			const fileModels = createFileModels(data.files)
			const fileEntries = createFileEntries(fileModels)

			this.setFileEntries(fileEntries)
			this.setTreeFiles(treeNormalize(fileModels))
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
		const entry = projectService.getEntryFromId(filePath) ?? projectService.getEntryFromPath(filePath)
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

	addPackageDependency(dependency: PackageDependencyType[]) {
		this.packageDependencies = _.uniqWith([...this.packageDependencies, ...dependency], _.isEqual)
	}

	removePackageDependency(dependency: PackageDependencyType[]) {
		this.packageDependencies = this.packageDependencies.filter(dep => !dependency.includes(dep))
	}
}

export const useProjectCodeStore = () => {
	return useStore().projects
}

export const getProjectCodeStore = () => {
	return getStore().projects
}
