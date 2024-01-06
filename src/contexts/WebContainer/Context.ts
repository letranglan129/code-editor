import { WebContainer } from '@webcontainer/api'
import { createContext } from 'react'

const Context = createContext<{
	boot?: () => Promise<WebContainer>
	webContainer?: WebContainer
}>({ boot: undefined, webContainer: undefined })

export default Context
