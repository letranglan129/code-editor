'use client'

import { toJS } from 'mobx'
import { sendEvent } from '../utils/events'
import { highlightTextRange, uuidv4 } from '../utils/strings'
import {
	FileDataType,
	FileEntriesType,
	ISearchConfig,
	LineSearchResult,
	ProjectDataType,
	SearchResult,
} from '../utils/types'

class ProjectService {
	currentProject?: ProjectDataType
	fileEntries: FileEntriesType = {}
	searchConfig: ISearchConfig = {
		searchString: '',
		isRegex: false,
		isMatchCase: false,
		results: {},
	}

	setCurrentProject(project: ProjectDataType) {
		this.currentProject = project
	}

	setFileEntries(fileEntries: FileEntriesType) {
		this.fileEntries = fileEntries
	}

	async search({ searchString = '', isRegex = false, isMatchCase = false }) {
		this.searchConfig = { searchString, isRegex, isMatchCase, results: {} }

		const files = Object.values(projectService.fileEntries)
		if (files.length > 0) {
			files.forEach(file => {
				if (file.content) {
					const findMatchesResult = file?.model?.findMatches(
						searchString,
						true,
						isRegex,
						isMatchCase,
						null,
						true,
						100,
					)
					if (!findMatchesResult) return

					const matchResults = findMatchesResult.map(match => {
						const lineContent = file?.model?.getLineContent(match.range.startLineNumber)
						const matchResult = {
							lineContent,
							range: match.range,
							matches: match.matches,
							htmlView: highlightTextRange(lineContent!, match.range),
							id: uuidv4(),
						}

						return matchResult
					})

					if (matchResults.length > 0)
						this.searchConfig.results[file.id] = {
							id: file.id,
							name: file.name,
							type: file.type,
							children: matchResults,
						}
				}
			})
		}

		return true
	}

	getEntries() {
		return this.fileEntries
	}

	getEntriesNomalized() {
		const entries: FileEntriesType = {}

		for (const entry of Object.values(this.fileEntries)) {
			if (entries[entry.id] || entry.name.trim() === "") continue
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

	getEntriesSimpleModel() {
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
				model: entry.model,
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
