'use client'

import AppWrapper from '../AppWrapper'
import EditorPage from '../Editor/EditorPage'
import { landingPageProject } from '../Modal/contents/ProjectManager'
import { StoreProvider, StoreProviderProps } from '@/store/builder'
import { getLocalState } from '@/utils/localState'
import { ProjectType } from '@/utils/types'

export interface CreateEditorOptions {
	root?: string | HTMLElement
	serviceWorker?: boolean
	debug?: boolean
	gjsScript?: string
	gjsStyle?: string
}

export interface AppProps {
	options: CreateEditorOptions
}

const GJS_VERSION = '0.21.7'

function App({ options }: AppProps) {
	const gjsDevHost = 'http://localhost:8080'
	const isDev = process.env.NODE_ENV !== 'production'
	const {
		root,
		gjsScript = `https://unpkg.com/grapesjs@${GJS_VERSION}`,
		gjsStyle = `https://unpkg.com/grapesjs@${GJS_VERSION}/dist/css/grapes.min.css`,
	} = options

	const initialState: StoreProviderProps['initialState'] = {
		localSettingsStore: getLocalState(),
		appEditorStore: {
			isDev,
			projectType: ProjectType.web,
			updateAppShell: true,
			editorConfig: {
				// project: blankWebProject,
				defaultProject: landingPageProject,
				gjsScript: 'https://unpkg.com/grapesjs',
				// gjsScript: isDev ? `${gjsDevHost}/grapes.min.js` : gjsScript,
				gjsStyle: 'https://unpkg.com/grapesjs/dist/css/grapes.min.css',
				// gjsStyle: isDev ? `${gjsDevHost}/dist/css/grapes.min.css` : gjsStyle,
			},
		},
	}

	return (
		<StoreProvider initialState={initialState}>
			<AppWrapper>
				<EditorPage />
			</AppWrapper>
		</StoreProvider>
	)
}

export default App
