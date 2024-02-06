'use client'

import { SocketProvider } from '../../contexts/SocketIO/Provider'
import WebContainerProvicer from '../../contexts/WebContainer/Provider'
import { StoreProvider } from '../../store/codeProvider'
import CodeEditor from '../ProjectEnv/CodeEditor'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function App({ projectId }: { projectId: string }) {
	return (
		<StoreProvider>
			<DndProvider backend={HTML5Backend}>
				<SocketProvider>
				<WebContainerProvicer>
					<CodeEditor projectId={projectId} />
				</WebContainerProvicer>
				</SocketProvider>
			</DndProvider>
		</StoreProvider>
	)
}

export default App
