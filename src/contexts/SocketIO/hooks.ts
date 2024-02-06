'use client'

import { useContext } from 'react'
import { SocketContext } from './Context'

export const useSocket = () => {
	return useContext(SocketContext)
}
