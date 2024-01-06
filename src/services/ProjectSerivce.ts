'use client'

import { FileDataType, FileEntriesType, ProjectDataType } from '../utils/types'

class ProjectService {
	currentProject?: ProjectDataType
	fileEntries: FileEntriesType = {}

	setCurrentProject(project: ProjectDataType) {
		this.currentProject = project
	}

	setFileEntries(fileEntries: FileEntriesType) {
		this.fileEntries = fileEntries
	}

	getEntries() {
		return this.fileEntries
	}

	getEntriesNomalized() {
		const entries: FileEntriesType = {}

		for (const entry of Object.values(this.fileEntries)) {
			if (entries[entry.id]) continue
			entries[entry.id] = {
				id: entry.id,
				project_id: entry.project_id,
				parent_id: entry.parent_id,
				name: entry.name,
				type: entry.type,
				content: entry?.model?.getValue() ?? null,
			}
		}

		return entries
	}

	getCurrentProject() {
		return this.currentProject
	}

	getEntryFromId(id: string) {
		return this.fileEntries[id] ?? null
	}

	getEntryFromPath(path: string) {
		return this.fileEntries[path] ?? null
	}

	getEntryModelFromId(id: string) {
		return this.fileEntries[id] ? this.fileEntries[id].model : null
	}

	getEntryModelFromPath(path: string) {
		return this.fileEntries[path] ? this.fileEntries[path].model : null
	}

	getEntryValueFromPath(path: string) {
		//@ts-ignore
		return this.fileEntries[path] ? this.fileEntries[path].getValue() : null
	}
}

const projectService = new ProjectService()

export default projectService
