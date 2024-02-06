import { FitAddon } from '@xterm/addon-fit'
import { Terminal as XTermTerminal } from '@xterm/xterm'
import { WebLinksAddon } from '@xterm/addon-web-links'
import React, {
	ForwardedRef,
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import webContainerService, { TerminalIdentify } from '../../../services/WebContainerService'
import { listenEvent, sendEvent } from '../../../utils/events'
import { FaPlus, FaTrashCan, FaX } from 'react-icons/fa6'
import { BsTerminal } from 'react-icons/bs'
import 'xterm/css/xterm.css'
import { uuidv4 } from '../../../utils/strings'
import { WebContainerProcess } from '@webcontainer/api'
import { observer } from 'mobx-react-lite'

type TerminalListenerAddonIdentifyType = TerminalIdentify & {
	func: () => any
	fitAddon: FitAddon
}

type TerminalProps = {
	handleHidden: () => void
}

export type TerminalRef = {
	createTerminal: (id?: string) => void
	closeTerminal: (id: string) => void
	openTerminal: (id: string) => void
}

const Terminal = memo(
	observer(
		forwardRef(function Terminal({ handleHidden }: TerminalProps, ref: ForwardedRef<TerminalRef>) {
			const terminalElRef = useRef<HTMLDivElement>(null)
			const [terminals, setTerminals] = useState<TerminalListenerAddonIdentifyType[]>([])
			const [activeTermId, setActiveTermId] = useState<string>('terminal')
			
			useEffect(() => {
				if (!terminalElRef.current) return
				terminalElRef.current.innerHTML = ''

				const terminal = new XTermTerminal({
					convertEol: true,
					fontSize: 13,
					lineHeight: 1.2,
				})

				webContainerService.addTerminal(terminal, 'terminal', true)

				const fitAddon = new FitAddon()
				terminal.loadAddon(new WebLinksAddon())
				terminal.loadAddon(fitAddon)
				terminal.open(terminalElRef.current)
				fitAddon.fit()

				setTerminals(prev => [...prev.filter(t => t.id !== 'terminal'), { id: 'terminal', t: terminal, func: () => {}, fitAddon }])
				setActiveTermId('terminal')

				const remove = listenEvent('terminal-fit', () => fitAddon.fit())
				return remove
			}, [])

			useEffect(() => {
				const test = async () => {
					if (activeTermId === '') return
					const el = document.getElementById(activeTermId)
					const term = terminals.find(t => t.id === activeTermId)

					if (!term || !el) return
					term.t.open(el)
					term.fitAddon.fit()

					await webContainerService.startShell(activeTermId)
				}
				test()
			}, [activeTermId])

			const createTerminal = useCallback(async (_id?: string) => {
				if (!terminalElRef.current) return

				let id: string = typeof _id === 'string' ? _id : uuidv4()
				const terminal = new XTermTerminal({
					convertEol: true,
					fontSize: 13,
					lineHeight: 1.2,
				})

				webContainerService.addTerminal(terminal, id, false)

				const fitAddon = new FitAddon()
				terminal.loadAddon(new WebLinksAddon())
				terminal.loadAddon(fitAddon)

				const remove = listenEvent('terminal-fit', () => fitAddon.fit())
				setTerminals(prev => [...prev, { id, t: terminal, func: remove, fitAddon }])
				setActiveTermId(id)
			}, [])

			const closeTerminal = useCallback(
				async (id: string) => {
					const term = terminals.find(t => t.id === id)
					setTerminals(prev => prev.filter(t => t.id !== id))
					webContainerService.removeTerminal(id)

					if (!term) return
					term.t.dispose()
					setActiveTermId('terminal')
				},
				[terminals],
			)

			const openTerminal = useCallback(
				async (id: string) => {
					const term = terminals.find(t => t.id === id)
					if (!term) return
					term.t.open(document.getElementById(id)!)
					term.fitAddon.fit()
				},
				[terminals],
			)

			useImperativeHandle(ref, () => ({
				createTerminal,
				closeTerminal,
				openTerminal,
			}))

			return (
				<div className="bg-black h-full overflow-hidden flex flex-col">
					<div className="flex items-center justify-between">
						<p className="px-3 py-2">Terminal</p>
						<div>
							<button className="p-2" onClick={() => createTerminal()}>
								<FaPlus />
							</button>
							<button className="p-2" onClick={handleHidden}>
								<FaX />
							</button>
						</div>
					</div>
					<div className="flex flex-1 overflow-hidden">
						<div
							ref={terminalElRef}
							className={`flex-1 px-3 py-2 ${activeTermId !== 'terminal' ? 'hidden' : ''}`}
							style={{ width: 'calc(100% - 200px)' }}
							id="terminal"
						></div>
						{terminals.map(
							t =>
								t.id !== 'terminal' && (
									<div
										key={t.id}
										className={`flex-1 px-3 py-2 ${activeTermId !== t.id ? 'hidden' : ''}`}
										style={{ width: 'calc(100% - 200px)' }}
										id={t.id}
									></div>
								),
						)}
						<div className="w-40 px-2">
							<div
								className="flex items-center justify-center"
								onClick={() => {
									setActiveTermId('terminal')
								}}
							>
								<div className="flex-1 flex items-center">
									<span>
										<BsTerminal />
									</span>
									<span>Main Bash</span>
								</div>
							</div>
							{terminals.map(
								(term, i) =>
									term.id !== 'terminal' && (
										<div className="flex items-center justify-center" key={i}>
											<div
												className="flex-1 flex items-center"
												onClick={() => {
													setActiveTermId(term.id)
												}}
											>
												<span>
													<BsTerminal />
												</span>
												<span>Sub Bash</span>
											</div>
											<div>
												<button
													onClick={() => {
														closeTerminal(term.id)
													}}
												>
													<FaTrashCan />
												</button>
											</div>
										</div>
									),
							)}
						</div>
					</div>
				</div>
			)
		}),
	),
)

export default Terminal
