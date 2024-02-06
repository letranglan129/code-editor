import React, { useEffect, useState } from 'react'
import webContainerService from '../../../services/WebContainerService'
import { VscPlug } from 'react-icons/vsc'
import { Port } from '../../../utils/types'
import { listenEvent } from '../../../utils/events'

export default function Port() {
	const [ports, setPorts] = useState<Port[]>([])
	const [portActive, setPortActive] = useState<Port | null>(null)

	const handleActivePort = (port: Port) => {
		webContainerService.setPortActive(port)
	}

	useEffect(() => {
		setPorts(webContainerService.getPorts())
		setPortActive(webContainerService.getPortActive())
	}, [])

	useEffect(() => {
		const removeEventPort = listenEvent('web-container:add-port', () => {
			setPorts(webContainerService.getPorts())
		})

		const removeEventPortActive = listenEvent('web-container:active-port', () => {
			setPortActive(webContainerService.getPortActive())
		})

		const removeEventRemovePort = listenEvent('web-container:remove-port', () => {
			setPorts(webContainerService.getPorts())
		})

		return () => {
			removeEventPort()
			removeEventPortActive()
			removeEventRemovePort()
		}
	}, [])

	return (
		<div className="flex h-full flex-col ">
			<div className="flex h-10 flex-shrink-0 items-center justify-between px-3 text-11">
				<h2>PORTS IN USE</h2>
			</div>
			<div className="px-3">
				{ports.map((port, index) => (
					<button
						className="flex h-8 items-center text-12 text-gray-300"
						key={port.port}
						title={port.url}
						onClick={() => handleActivePort(port)}
					>
						<VscPlug className={`text-3xl ${portActive?.port === port.port ? 'text-green-600' : ''}`} />
						<div key={index} className="flex w-full items-center justify-between">
							<span>{port.port}</span>
						</div>
					</button>
				))}
			</div>
		</div>
	)
}
