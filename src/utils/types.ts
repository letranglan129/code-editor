import { monaco } from 'react-monaco-editor'
import { Server as NetServer, Socket } from 'net'
import { NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { Range } from 'monaco-editor'
import { IUser } from '../modules/mongo/schema/User'

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
export type PermissionProjectType = {
	uuid: Pick<IUser, "_id" | 'fullName' | 'image' | 'email'>
	permissionName: 'editor' | 'viewer' | 'co-owner'
}

export type ProjectDataType = {
	_id: string
	parent_id: number | null
	project_id: number
	uuid: Pick<IUser, "_id" | 'fullName' | 'image' | 'email'>
	title: string
	description: string
	type: string[]
	visibility: string
	views_count: number
	forks_count: number
	created_at: string | null
	updated_at: string | null
	files: FileDataType[]
	cmdStartup?: string
	slug?: string
	isStarter?: boolean
	core?: string
	icon?: string
	isDeploy?: boolean
	publishUrl?: string
	permissions?: PermissionProjectType[]
}

export type FileDataType = {
	id: string
	project_id: number
	parent_id: string | null
	name: string
	type: string
	content: string | null
	contentUnsaved?: string
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

export type PackageDependencyType = {
	name: string
	version: string
}

export type ResultDependency = {
	package: {
		name: string
		version: string
		description: string
		date: string
		publisher: {
			username: string
			email: string
		}
		maintainers: [
			{
				username: string
				email: string
			},
		]
		links: {
			npm: string
			homepage: string
			repository: string
			bugs: string
		}
	}
}

export type ResultDependencies = {
	objects: ResultDependency[]
	total: number
	time: string
}

export type NextApiResponseServerIo = NextApiResponse & {
	socket: Socket & {
		server: NetServer & {
			io: SocketIOServer
		}
	}
}

export interface DxCustomStoreOptions {
	key?: string | Array<string>
	errorHandler?: (e: Error) => void

	loadUrl?: string
	loadParams?: Object
	loadMethod?: string

	updateUrl?: string
	updateMethod?: string

	insertUrl?: string
	insertMethod?: string

	deleteUrl?: string
	deleteMethod?: string

	loadMode?: 'processed' | 'raw'
	cacheRawData?: boolean

	onBeforeSend?: (
		operation: string,
		ajaxSettings: {
			cache?: boolean
			contentType?: any
			data?: any
			dataType?: string
			headers?: { [key: string]: any }
			method?: string
			password?: string
			timeout?: number
			url?: string
			username?: string
			xhrFields?: { [key: string]: any }
		},
	) => void | PromiseLike<any> | any
	onAjaxError?: (e: { xhr: XMLHttpRequest; error: string | Error }) => void

	onLoading?: (loadOptions: any) => void
	onLoaded?: (result: Array<any>) => void

	onInserting?: (values: any) => void
	onInserted?: (values: any, key: any) => void

	onUpdating?: (key: any, values: any) => void
	onUpdated?: (key: any, values: any) => void

	onRemoving?: (key: any) => void
	onRemoved?: (key: any) => void

	onModifying?: Function
	onModified?: Function

	onPush?: (changes: Array<any>) => void
}

export interface DxDataGridSorting {
	selector: string
	desc: boolean
}

type Condition = [string, string, string | number]

export interface DxDataGridFilter {
	[index: number]: Condition | string
}

export type Port = {
	port: number
	url: string
}

export enum VisibilityState {
	Private = 'private',
	Public = 'public',
	Secret = 'secret',
}

export type LineSearchResult = {
	lineContent: string | undefined
	range: Range
	matches: string[] | null
	htmlView: string[]
	id: string
}

export type SearchResult = Pick<FileDataType, 'id' | 'name' | 'type'> &
	Partial<LineSearchResult> & {
		children: LineSearchResult[]
	}

export type SearchResultObj = { [key: string]: SearchResult }

export interface ISearchConfig {
	searchString: string
	isRegex: boolean
	isMatchCase: boolean
	results: SearchResultObj
}

export type CodePaymentStatusType = {
	[key: string]: string
}

export type MessageReplicate = {
	text: string
	isUser: boolean
}

export type MessageReplicateTemplate = {
	role: string
	content: string
}