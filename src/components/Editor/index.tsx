'use client'

import GjsEditor, { AssetsProvider, Canvas, ModalProvider } from '@grapesjs/react'
import type { Editor } from 'grapesjs'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useAppEditorStore } from '../../store/appEditorStore'
import { usePluginStore } from '../../store/pluginStore'
import cx from '../../utils/makeCls'
import AssetManager from '../AssetManager'
import BlockManagerContainer from '../BlockManager/container'
import CanvasSpots from '../CustomCanvasSpot/CanvasSpots'
import Grid from '../Grid'
import GridItem from '../GridItem'
import Modal from '../Modal'
import { br, cl, ts } from '../theme'
import BuiltInRTE from './BuiltInRTE'
import EditorLeftSidebar from './EditorLeftSidebar'
import EditorRightSidebar from './EditorRightSidebar'
import EditorTopbar from './EditorTopbar'
import { getEditorOptions } from './editorOptions'
import { addComponent } from '../../utils/components'

export default observer(function EditorApp() {
	const { projectType, editorConfig, editorKey, setEditor } = useAppEditorStore()
	const pluginStore = usePluginStore()
	const [gjsOpts, gjsPlugins] = useMemo(
		() => [getEditorOptions(projectType), pluginStore.getPluginsToLoad(projectType)],
		[projectType, editorKey],
	)
	const onEditor = (editor: Editor) => {
		setEditor(editor)
		addComponent(editor, {
			id: 'JS',
			models: {
				default: {
					tagName: 'div',
					attributes: {
						'tag-code': 'JSCode',
						id: 'JSCode',
					},
					script: function (props: any) {
						const script = document.createElement('script')
						script.onload = () => {
							console.log('JSCode loaded')
						}
						script.src = 'https://cdn.jsdelivr.net/npm/preline@2.0.3/dist/preline.min.js'
						document.body.appendChild(script)
					},
				},
			},
			isComponent(el) {
				return el.id === 'JSCode'
			},
			component: () => <div></div>,
		})
		// @ts-ignore
		editor.BlockManager.add('js-block', {
			content: {
				type: 'JS',
			},
			label: 'JS',
		})
		;(window as any).editor = editor

		// Test infinite canvas
		editor.onReady(() => {
			// editor.Canvas.setZoom(70);
			// editor.Canvas.setCoords(-30, -30);
			// const firstFrame = editor.Canvas.getFrames()[0];
			// // Multi frames
			// editor.Canvas.addFrame({
			//   name: 'Mobile home page',
			//   x: firstFrame.width + 100, // Position in canvas
			//   // y: 0,
			//   width: 320, // Frame dimensions
			//   height: 420,
			//   refFrame: firstFrame,
			//   // device: 'DEVICE-ID',
			// });
			// editor.Canvas.fitViewport({ ignoreHeight: true, gap: 50 });
		})
	}

	return (
		<GjsEditor
			key={editorKey}
			className={cx('app-editor h-full w-full', br.b, cl.br)}
			grapesjs={editorConfig.gjsScript!}
			grapesjsCss={editorConfig.gjsStyle}
			options={gjsOpts}
			plugins={gjsPlugins}
			onEditor={onEditor}
		>
			<Grid className="h-full overflow-hidden">
				<EditorLeftSidebar />
				<GridItem grow>
					<Grid className="relative" col full>
						<EditorTopbar />
						<GridItem grow>
							<Canvas className="app-canvas relative bg-gray-50 dark:bg-zinc-800">
								{/* <WithEditor>
                  <CanvasDebug/>
                </WithEditor> */}
							</Canvas>
						</GridItem>
					</Grid>
				</GridItem>
				<EditorRightSidebar />
			</Grid>
			<BlockManagerContainer />
			<AssetsProvider>
				{({ assets, select, close, Container }) => (
					<Container>
						<AssetManager assets={assets} select={select} close={close} />
					</Container>
				)}
			</AssetsProvider>
			<ModalProvider>
				{({ open, title, close, content }) => (
					<Modal open={open} onClose={close} title={title} size="l">
						{content}
					</Modal>
				)}
			</ModalProvider>
			<CanvasSpots />
			<BuiltInRTE />
		</GjsEditor>
	)
})
