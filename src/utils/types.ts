import { monaco } from 'react-monaco-editor'

export const isDef = (value: any) => typeof value !== 'undefined'

export const isString = (value: any) => typeof value === 'string'

export type AnyObject = Record<string, any>

export type StringObject = Record<string, string>

export enum ProjectType {
	web = 'web',
}

type PluginOptions = Record<string, any>

export type InstallablePlugin = {
	id: string
	src: string
	version: string
	name?: string
	description?: string
	options?: PluginOptions
	projectType: ProjectType[]
}

export type LocalSettingsData = {
	plugins?: InstallablePlugin[]
}

export interface ProjectDataCustom {
	id?: string
	projectName?: string
	projectType?: ProjectType
	plugins?: InstallablePlugin[]
}

export interface ProjectData {
	[key: string]: any
	custom?: ProjectDataCustom
}

export interface ProjectItem {
	id: string
	name: string
	isTemplate?: boolean
	data: ProjectData
}

export interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[]
	readonly userChoice: Promise<{
		outcome: 'accepted' | 'dismissed'
		platform: string
	}>
	prompt(): Promise<void>
}

declare global {
	interface WindowEventMap {
		beforeinstallprompt: BeforeInstallPromptEvent
	}
}

export type ProjectDataType = {
	id: number
	parent_id: number | null
	uuid: string
	title: string
	description: string
	type: string
	visibility: string
	views_count: number
	forks_count: number
	created_at: string | null
	updated_at: string | null
	files: FileDataType[]
}

export type FileDataType = {
	id: string
	project_id: number
	parent_id: string | null
	name: string
	type: string
	content: string | null
	children?: FileDataType[]
	path?: string
	model?: monaco.editor.ITextModel
	isChanged?: boolean
	isCreating?: boolean
	isNew?: boolean
}

export type FileEntriesType = {
	[key: string]: FileDataType
}

export type FileTreeNomarlizedType = {
	id: string
	isPreview?: boolean
	children?: FileTreeNomarlizedType[]
}
