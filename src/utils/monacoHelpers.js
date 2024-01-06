import { monaco } from 'react-monaco-editor'
import { emmetHTML, emmetCSS, emmetJSX } from 'emmet-monaco-es'
import { detect } from 'program-language-detector'
const isSelfClosing = require('is-self-closing')

/**
 * Always return once instance of JSX worker.
 * @returns instance of JSXWorker
 */
const JSXWorker = new Worker('http://localhost:3000/jsx.worker.js')
export const getJSXWorker = () => {
	return JSXWorker
}

/**
 * Send code in editor to JSX worker.
 * @param {*} id
 * @param {string} fileName
 * @param {string} code
 * @param {number} version
 */
export const sendToJSXWorker = ({ id, fileName, code, version }) => {
	if (typeof code === 'string' && /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(fileName)) {
		getJSXWorker().postMessage({
			id,
			code,
			fileName,
			version,
		})
	}
}

/**
 * After recieved a message from JSX worker,
 * we need update classification to highlight JSX code.
 * @param {object} model
 * @param {array} decorations
 * @param {array} classifications
 */
export const updateDecorations = ({ model, decorations, classifications }) => {
	const _decorations = classifications.map(classification => ({
		range: new monaco.Range(
			classification.startLine,
			classification.start,
			classification.endLine,
			classification.end,
		),
		options: {
			inlineClassName: classification.kind,
		},
	}))
	if (!decorations) return

	if(model.isDisposed()) return
	decorations.data = model?.deltaDecorations(decorations.data ?? [], _decorations)
}

/**
 * Receive from JSX worker and update to editor.
 * @param {*} id
 * @param {function} getModel
 */
export const receiveFromJSXWorker = ({ id, getModel }) => {
	const decorations = {}

	const handle = event => {
		const { id: _id, classifications, version } = event.data
		const model = getModel()
		const uri = `${model.uri}`
		const isValidData = id === _id && !model.isDisposed() && model.getVersionId() === version

		if (!isValidData) return

		if (!decorations[uri]) {
			decorations[uri] = {}
		}

		requestAnimationFrame(() => {
			updateDecorations({
				model,
				decorations: decorations[uri],
				classifications,
			})
		})
	}
	getJSXWorker().addEventListener('message', handle)

	// Cleanup
	return {
		reset: () => {
			Object.keys(decorations).forEach(key => delete decorations[key])
		},
		removeListener: () => getJSXWorker().removeEventListener('message', handle),
	}
}

/**
 * Create payload for JSX worker
 * @param {*} id
 * @param {object} file
 * @returns object
 */
export const createJSXWorkerPayload = (id, file) => ({
	id,
	fileName: file.name,
	code: file.model?.getValue() || '',
	version: file.model?.getVersionId(),
})

/**
 * Format code with prettier
 * @param {*} code
 * @returns string
 */

// export const formatCode = (() => {
// 	let prettier, babel

// 	return async code => {
// 		if (!prettier) prettier = await import('prettier/standalone')
// 		if (!babel) babel = await import('prettier/parser-babel')
// 		const beautifulCode = prettier.format(code, {
// 			parser: 'babel',
// 			plugins: [babel],
// 			arrowParens: 'always',
// 			bracketSameLine: false,
// 			bracketSpacing: true,
// 			embeddedLanguageFormatting: 'auto',
// 			htmlWhitespaceSensitivity: 'css',
// 			insertPragma: false,
// 			jsxSingleQuote: false,
// 			printWidth: 80,
// 			proseWrap: 'preserve',
// 			quoteProps: 'as-needed',
// 			requirePragma: false,
// 			semi: true,
// 			singleQuote: true,
// 			tabWidth: 4,
// 			trailingComma: 'all',
// 			useTabs: false,
// 			vueIndentScriptAndStyle: false,
// 		})
// 		return beautifulCode
// 	}
// })()

export const getGrammarAndLanguageFromCode = code => {
	const language = detect(code || '').toLowerCase()

	const grammars = {
		javascript: 'jsx',
		html: 'html',
		css: 'css',
	}
	const languages = {
		javascript: 'typescript',
	}

	return {
		grammar: grammars[language] ?? language,
		language: languages[language] ?? language,
	}
}

export const sortFiles = files => {
	// sort main.js first, then all other .js files then .html then .css
	return files.sort((a, b) => {
		if (a.name === 'main.js') {
			return -1
		}
		if (a.name.endsWith('.js') && !b.name.endsWith('.js')) {
			return -1
		}
		if (a.name.endsWith('.html') && b.name.endsWith('.css')) {
			return -1
		}
		return 1
	})
}

export const addAutoCloseTag = editor => {
	editor.onKeyDown(event => {
		// when the user enters '>'
		if (event.browserEvent.key === '>') {
			const model = editor.getModel()
			const currentSelections = editor.getSelections()

			const edits = []
			const newSelections = []
			// potentially insert the ending tag at each of the selections
			for (const selection of currentSelections) {
				// shift the selection over by one to account for the new character
				newSelections.push(
					new monaco.Selection(
						selection.selectionStartLineNumber,
						selection.selectionStartColumn + 1,
						selection.endLineNumber,
						selection.endColumn + 1,
					),
				)
				// grab the line before the cursor
				const lineBeforeChange = model.getValueInRange({
					startLineNumber: selection.endLineNumber,
					startColumn: 1,
					endLineNumber: selection.endLineNumber,
					endColumn: selection.endColumn,
				})

				// if ends with a HTML tag we are currently closing
				const tag = lineBeforeChange.match(/.*<([\w-]+)$/)?.[1]
				if (!tag) {
					continue
				}

				// skip self-closing tags like <br> or <img>
				if (isSelfClosing(tag)) {
					continue
				}

				// add in the closing tag
				edits.push({
					range: {
						startLineNumber: selection.endLineNumber,
						startColumn: selection.endColumn + 1, // add 1 to offset for the inserting '>' character
						endLineNumber: selection.endLineNumber,
						endColumn: selection.endColumn + 1,
					},
					text: `</${tag}>`,
				})
			}

			// wait for next tick to avoid it being an invalid operation
			setTimeout(() => {
				editor.executeEdits(model.getValue(), edits, newSelections)
			}, 0)
		}
	})
}

export const enableHtmlCssEmmet = () => {
	emmetHTML(monaco)
	emmetCSS(monaco)
	emmetJSX(monaco)
}
