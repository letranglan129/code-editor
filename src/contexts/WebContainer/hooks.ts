import { useContext } from 'react'
import Context from './Context'

export const useWebContainer = () => {
	const context = useContext(Context)
	return context
}
