'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { io } from 'socket.io-client'
import { SocketContext } from './Context'

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	const [socket, setSocket] = useState(null)
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		const socketInstance = io('wss://ws.letranglan.top', {
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			autoConnect: false,
			withCredentials: true,
			transports: ['websocket', 'polling', 'flashsocket'],
		})

		socketInstance.connect()

		socketInstance.on('connect', () => {
			console.log('connect')
			setIsConnected(true)
		})

		socketInstance.on('disconnect', () => {
			console.log('disconnect')
			setIsConnected(false)
		})

		setSocket(socketInstance as any)

		return () => {
			socketInstance.disconnect()
		}
	}, [])

	return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}
