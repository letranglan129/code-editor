'use client'

import { StoreProvider, StoreProviderProps } from '@/store/codeEditor'
import { getLocalState } from '@/utils/localState'
import CodeEditor from '../ProjectEnv/CodeEditor'
import WebContainerProvicer from '../../contexts/WebContainer/Provider'


function App() {
	const initialState: StoreProviderProps['initialState'] = {
		localSettingsStore: getLocalState(),
	}

	return (
		<StoreProvider initialState={initialState}>
            <WebContainerProvicer>
                <CodeEditor/>
            </WebContainerProvicer>
		</StoreProvider>
	)
}

export default App
