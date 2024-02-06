"use client"

import React from 'react'
import { landingPageProject } from '../../components/Modal/contents/ProjectManager'
import { StoreProvider } from '../../store'
import { getLocalState } from '../../utils/localState'
import { ProjectType } from '../../utils/types'
import GlobalModal from '../../components/Modal/GlobalModal'
import GlobalToasts from '../../components/Toast/GlobalToasts'

export default function layout({ children }: { children: React.ReactNode }) {
	const isDev = process.env.NODE_ENV !== 'production'

	const initialState = {
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
			{children}
			<GlobalModal />
			<GlobalToasts />
		</StoreProvider>
	)
}
