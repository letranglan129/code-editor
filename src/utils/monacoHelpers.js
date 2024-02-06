import { monaco } from 'react-monaco-editor'
import { emmetHTML, emmetCSS, emmetJSX } from 'emmet-monaco-es'
const isSelfClosing = require('is-self-closing')

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
