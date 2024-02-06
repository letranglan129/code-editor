import { observer } from 'mobx-react-lite'
import { editor } from 'monaco-editor'
import { ForwardedRef, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import MonacoEditor, { monaco } from 'react-monaco-editor'
import editorService from '../../../services/EditorService'
import webContainerService from '../../../services/WebContainerService'
import { useProjectCodeStore } from '../../../store/projects'
import { LANGUAGES } from '../../../utils/constant'
import { listenEvent } from '../../../utils/events'
import * as monacoHelpers from '../../../utils/monacoHelpers'
import SelectField from '../../SelectField'
import Navigation, { EditorRef } from './Navigation'
import Scrollbar from '../../Scrollbar'
import { stringToBase64 } from 'uint8array-extras'

monaco.editor.defineTheme('my-dark', {
	base: 'vs-dark',
	inherit: true,
	rules: [],
	colors: {
		'editor.background': '#15181e',
	},
})

// Apply emmets
monacoHelpers.enableHtmlCssEmmet()

type EditorProps = {
	onChange: (value: string, event: editor.IModelContentChangedEvent) => void
}

export type EditorNavRef = { navRef: EditorRef | null }
const langs = LANGUAGES.map(lang => ({ id: lang.id, label: lang.id })).sort((a, b) => a.id.localeCompare(b.id))

export default memo(
	observer(
		forwardRef(function Editor({ onChange }: EditorProps, ref: ForwardedRef<EditorNavRef>) {
			const projectCodeStore = useProjectCodeStore()
			const navRef = useRef<EditorRef>(null)
			const [langSelected, setSelectedLang] = useState<string>('')
			const imageRef = useRef<HTMLImageElement>(null)
			const [isShowEditor, setIsShowEditor] = useState<string>('code')

			const handleCodeChange = useCallback(
				(value: string, event: editor.IModelContentChangedEvent) => {
					if (event && event.isFlush) return
					// Save the file to the web container
					const file = editorService.getCurrentFile()
					if (file === null) return
					editorService.setCurrentFile({ ...file, contentUnsaved: value })

					// Send event to update the tree
					navRef.current?.openFile(file)

					// handle code change
					onChange(value, event)
				},
				[onChange],
			)

			useEffect(() => {
				const remove = listenEvent('updateLanguage', () => {
					const model = editorService.getEditor()?.getModel()
					if (model) {
						const langId = model?.getLanguageId()
						setSelectedLang(langId)
					} else {
						setSelectedLang('')
					}
				})

				return remove
			}, [])

			useImperativeHandle(
				ref,
				() => ({
					get navRef() {
						return navRef.current
					},
				}),
				[],
			)

			const handleSelectLang = (lang: string) => {
				const model = editorService.getEditor()?.getModel()
				if (model) {
					monaco.editor.setModelLanguage(model, lang)
				}

				setSelectedLang(lang)
			}

			useEffect(() => {
				const removeOpen = listenEvent('openImageEditor', async () => {
					setIsShowEditor('image')
					const file = editorService.getCurrentFile()
					if (imageRef.current) imageRef.current.src = 'data:image/png;base64,' + file?.content
				})

				const removeClose = listenEvent('closeImageEditor', () => {
					setIsShowEditor('code')
					if (imageRef.current) imageRef.current.src = ''
				})

				return () => {
					removeOpen()
					removeClose()
				}
			}, [])

			useEffect(() => {
				const remove = listenEvent('terminal-fit', () => {
					editorService.layout()
				})

				return remove
			}, [])

			return (
				<>
					<div className="flex justify-between">
						<Navigation ref={navRef} />
						{isShowEditor === 'code' && langSelected && (
							<div className="w-28 flex-shrink-0">
								<SelectField
									border={false}
									className="flex h-10 items-center overflow-hidden"
									emptyState="..."
									size="xs"
									value={langSelected}
									options={langs}
									onChange={handleSelectLang}
								/>
							</div>
						)}
					</div>
					<div className={`flex-1 ${isShowEditor !== 'code' ? 'hidden' : ''}`}>
						<MonacoEditor
							key={projectCodeStore.project?._id}
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
							overrideServices={{}}
							onChange={handleCodeChange}
							editorDidMount={(editor, monaco) => {
								editorService.setEditor(editor, monaco)
								monacoHelpers.addAutoCloseTag(editor)
								monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
									noSemanticValidation: true,
									noSyntaxValidation: true,
								})

								monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
									// jsx: 'react',
									jsx: monaco.languages.typescript.JsxEmit.React,
									jsxFactory: 'React.createElement',
									reactNamespace: 'React',
									allowNonTsExtensions: true,
									allowJs: true,
									target: monaco.languages.typescript.ScriptTarget.Latest,
								})
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
					<div className={`flex-1 ${isShowEditor !== 'image' ? 'hidden' : ''}`}>
						<Scrollbar className="ImageEditor">
							<div className="flex h-full w-full min-w-64 items-center justify-center p-2">
								<img src="" alt="" ref={imageRef} />
							</div>
						</Scrollbar>
					</div>
				</>
			)
		}),
	),
)
