import { FitAddon } from '@xterm/addon-fit'
import { Terminal as XTermTerminal } from '@xterm/xterm'
import { WebLinksAddon } from '@xterm/addon-web-links'
import React, { memo, useEffect, useRef } from 'react'
import webContainerService from '../../../services/WebContainerService'
import { listenEvent } from '../../../utils/events'
import { FaPlus, FaTrashCan, FaX } from 'react-icons/fa6'
import { BsTerminal } from 'react-icons/bs'
import 'xterm/css/xterm.css'

const Terminal = memo(function Terminal() {
	const terminalElRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!terminalElRef.current) return
		
		const terminal = new XTermTerminal({
			convertEol: true,
			fontSize: 13,
			lineHeight: 1.2,
		})
		webContainerService.setTerminal(terminal)

		const fitAddon = new FitAddon()
		terminal.loadAddon(new WebLinksAddon())
		terminal.loadAddon(fitAddon)
		terminal.open(terminalElRef.current)
		fitAddon.fit()

		const remove = listenEvent('terminal-fit', () => fitAddon.fit())
		return remove
	}, [])

	return (
		<div className="bg-black h-full overflow-hidden flex flex-col">
			<div className="flex items-center justify-between">
				<p className="px-3 py-2">Terminal</p>
				<div>
					<button className="p-2">
						<FaPlus />
					</button>
					<button className="p-2">
						<FaX />
					</button>
				</div>
			</div>
			<div className="flex flex-1 overflow-hidden">
				<div
					ref={terminalElRef}
					className="flex-1 px-3 py-2"
					style={{ width: 'calc(100% - 160px)' }}
					id="terminal"
				></div>
				<div className="w-40 px-2">
					<div className="flex items-center justify-center">
						<div className="flex-1 flex items-center">
							<span>
								<BsTerminal />
							</span>
							<span>bash</span>
						</div>
						<div>
							<button>
								<FaTrashCan />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
})

export default Terminal
