import { useCallback, useState } from 'react'
import Context from './Context'
import { WebContainer } from '@webcontainer/api'
import webContainerService from '../../services/WebContainerService'

function Provider({ children }: { children: React.ReactNode }) {
	const [webContainer, setWebContainer] = useState<WebContainer | undefined>()

	const boot = useCallback(async () => {
        const instance = webContainerService.getWebContainer()
		if (instance) return instance

		const webContainer = await WebContainer.boot({
			coep: 'credentialless',
        })

        webContainerService.setWebContainer(webContainer);
        setWebContainer(webContainer);
        return webContainer;
	}, [])

	return <Context.Provider value={{ boot, webContainer }}>{children}</Context.Provider>
}

export default Provider

