import { observer } from 'mobx-react-lite'
import { editor } from 'monaco-editor'
import { ForwardedRef, forwardRef, memo, useCallback, useImperativeHandle, useRef } from 'react'
import MonacoEditor, { monaco } from 'react-monaco-editor'
import editorService from '../../../services/EditorService'
import { useProjectCodeStore } from '../../../store/codeEditor/projects'
import * as monacoHelpers from '../../../utils/monacoHelpers'
import Navigation, { EditorRefType } from './Navigation'

// Apply emmets
monacoHelpers.enableHtmlCssEmmet()

type EditorProps = {
	onChange: (value: string, event: editor.IModelContentChangedEvent) => void
}

export type EditorNavRefType = { navRef: EditorRefType | null }

export default memo(
	observer(
		forwardRef(function Editor({ onChange }: EditorProps, ref: ForwardedRef<EditorNavRefType>) {
			const projectCodeStore = useProjectCodeStore()
			const navRef = useRef<EditorRefType>(null)

			const handleCodeChange = useCallback(
				(value: string, event: editor.IModelContentChangedEvent) => {
					if (event && event.isFlush) return
					// Save the file to the web container
					const file = editorService.getCurrentFile()
					if (file === null) return
					// webContainerService.writeFile(file.path, code)

					// Send event to update the tree
					navRef.current?.openFile(file)

					// Send code to JSX worker
					const payload = monacoHelpers.createJSXWorkerPayload(file.path, file)
					monacoHelpers.sendToJSXWorker(payload)
				},
				[onChange],
			)

			useImperativeHandle(
				ref,
				() => ({
					get navRef() {
						return navRef.current
					},
				}),
				[],
			)

			return (
				<>
					<Navigation ref={navRef} />
					<div className="flex-1">
						<MonacoEditor
							key={projectCodeStore.project?.id} // force re-render when project changed
							theme="my-dark"
							options={{
								fontSize: 13,
								lineHeight: 18,
								wordWrap: 'on', // this breaks TS but it's correct
								minimap: {
									enabled: false,
								},
								language: 'typescript',
								scrollBeyondLastLine: true,
								fontFamily: 'var(--font-code)',
								fontLigatures: false,
								lineNumbersMinChars: 3,
								smoothScrolling: true,
								padding: {
									top: 8,
									bottom: 8,
								},
							}}
							overrideServices={{

							}}
							// value={code}
							onChange={handleCodeChange}
							editorDidMount={(editor, monaco) => {
								editorService.setEditor(editor, monaco)
								monacoHelpers.addAutoCloseTag(editor)
								
								/**
								 * Fixed: Misplaced cursor on Windows
								 * https://github.com/microsoft/monaco-editor/issues/1626
								 */
								document.fonts.ready.then(() => {
									monaco.editor.remeasureFonts()
								})
							}}
						/>
					</div>
				</>
			)
		}),
	),
)
