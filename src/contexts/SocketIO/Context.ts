'use client'
import { createContext } from 'react'
import { Socket } from 'socket.io'

type SocketContextType = {
	socket: Socket | null
	isConnected: boolean
}

export const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
})
