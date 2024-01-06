'use client'

import debounce from 'lodash.debounce'
import { monaco } from 'react-monaco-editor'
import { FileDataType } from '../utils/types'

class EditorService {
	_editor: monaco.editor.IStandaloneCodeEditor | null = null
	_monaco: typeof monaco | null = null
	_currentFile: any = null

	setEditor(editor: monaco.editor.IStandaloneCodeEditor, monaco: any) {
		this._editor = editor
		this._monaco = monaco
	}

	setCurrentFile(file: FileDataType | null) {
		this._currentFile = file
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

	layout = debounce(() => {
		this._editor && this._editor.layout()
	}, 10)
}

const editorService = new EditorService()

export default editorService
