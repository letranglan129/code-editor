'use client'

import AppWrapper from '../AppWrapper'
import EditorPage from '../Editor/EditorPage'

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

function App({ options }: AppProps) {
	return (
		<AppWrapper>
			<EditorPage />
		</AppWrapper>
	)
}

export default App
