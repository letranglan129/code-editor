'use client'

import debounce from 'lodash.debounce'
import { monaco } from 'react-monaco-editor'
import { FileDataType } from '../utils/types'
import { BundledLanguage, BundledTheme, HighlighterGeneric, getHighlighter } from 'shiki'
import { shikiToMonaco } from '@shikijs/monaco'
import { LANGUAGES } from '../utils/constant'
import { myDarkPlus } from '@/plugins/themes/dark-plus'
import { sendEvent } from '../utils/events'

class EditorService {
	_editor: monaco.editor.IStandaloneCodeEditor | null = null
	_monaco: typeof monaco | null = null
	_currentFile: any = null
	_highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null

	setEditor(editor: monaco.editor.IStandaloneCodeEditor, monaco: any) {
		this._editor = editor
		this._monaco = monaco
		this.loadHighlighter()

		sendEvent('terminal-fit')
	}

	setCurrentFile(file: FileDataType | null) {
		this._currentFile = file
		//@ts-ignore
		shikiToMonaco(this._highlighter!, editorService.getMonaco())
		sendEvent('terminal-fit')
	}

	getEditor() {
		return this._editor
	}

	getMonaco() {
		return this._monaco
	}

	getCurrentFile(): FileDataType | null {
		return this._currentFile
	}

	async loadHighlighter() {
		this._highlighter = await getHighlighter({
			themes: [myDarkPlus],
			langs: LANGUAGES.map(lang => lang.id as BundledLanguage),
		})

		LANGUAGES.forEach(async lang => {
			await this._highlighter?.loadLanguage(lang.id as BundledLanguage)

			editorService.getMonaco()?.languages.register(lang)
		})

		// @ts-ignore
		shikiToMonaco(this._highlighter, editorService.getMonaco())
		editorService.getMonaco()?.editor.setTheme('my-dark-plus')
	}

	layout = debounce(() => {
		this._editor && this._editor.layout()
	}, 10)
}

const editorService = new EditorService()

export default editorService
