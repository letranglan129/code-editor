'use client'

// import { listenEvent, sendEvent } from '@/utils/events'
import { FSWatchOptions, WebContainer, WebContainerProcess, BufferEncoding } from '@webcontainer/api'
import debounce from 'lodash.debounce'
import { Terminal } from 'xterm'
import { listenEvent, sendEvent } from '../utils/events'
import { Port } from '../utils/types'

export type TerminalIdentify = {
	id: string
	t: Terminal
}

export type WebContainerProcessIdentify = {
	id: string
	p?: WebContainerProcess
}

export type WritableStreamDefaultWriterIdentify = {
	id: string
	i?: WritableStreamDefaultWriter<string>
}

type FirstTimeType = {
	id: string
	state: boolean
}

class WebContainerService {
	_webContainer!: WebContainer
	_terminals: TerminalIdentify[] = []
	_shellProcesses: WebContainerProcessIdentify[] = []
	_shellInputs: WritableStreamDefaultWriterIdentify[] = []
	_firstTimes: FirstTimeType[] = []
	_listener?: () => any
	_activeTerm: string = ''
	_portActive: Port | null = null
	_ports: Port[] = []

	constructor() {
		this._activeTerm = 'terminal'
		this.createListener()
	}

	setPortActive(port: Port) {
		this._portActive = port
		sendEvent('web-container:active-port', port)
	}

	getPortActive() {
		return this._portActive
	}

	addPort(port: Port) {
		this._ports = this._ports.filter(p => p.port !== port.port)
		this._ports.push(port)
		sendEvent('web-container:add-port')
	}

	removePort(port: number) {
		this._ports = this._ports.filter(p => p.port !== port)
		sendEvent('web-container:remove-port')
		const portActive = this._ports.slice(-1)[0]
		portActive && this.setPortActive(portActive || { port: 0, url: '' })
	}

	getPorts() {
		return this._ports
	}

	removeListener() {
		this._listener && this._listener()
	}

	createListener() {
		this._listener = listenEvent('terminal-fit', () => {
			this._shellProcesses.forEach(shellProcess => {
				if (!shellProcess.p) return

				const term = this._terminals.find(t => t.id === shellProcess.id)
				term &&
					shellProcess.p.resize({
						cols: term.t.cols,
						rows: term.t.rows,
					})
			})
		})
	}

	setWebContainer(webContainer: WebContainer) {
		this._webContainer = webContainer
	}

	addTerminal(terminal: Terminal, id: string, firstTime: boolean = false) {
		this.removeListener()
		if (this._terminals.find(t => t.id === id)) {
			this.removeTerminal(id)
		}
		this._terminals.push({
			t: terminal,
			id,
		})
		this._firstTimes.push({
			state: firstTime,
			id,
		})
		this._shellProcesses.push({
			id,
		})
		this._shellInputs.push({
			id,
		})
		this.createListener()
	}

	removeTerminal(id: string) {
		this.removeListener()
		this._terminals = this._terminals.filter(t => t.id !== id)
		this._firstTimes = this._firstTimes.filter(t => t.id !== id)
		this._shellProcesses = this._shellProcesses.filter(t => t.id !== id)
		this._shellInputs = this._shellInputs.filter(t => t.id !== id)
		this.createListener()
	}

	getWebContainer() {
		return this._webContainer
	}

	getTerminal(id: string) {
		return this._terminals.find(t => t.id === id)
	}

	writeFile = debounce(async (filePath, content) => {
		if (!this._webContainer) return
		await this._webContainer.fs.writeFile(filePath, content)
	}, 800)

	watchFile(filePath: string, callback?: FSWatchOptions) {
		if (!this._webContainer) return
		return this._webContainer.fs.watch(filePath, callback)
	}

	async readFile(filePath: string, encoding: BufferEncoding = 'utf-8') {
		if (!this._webContainer) return
		const content = await this._webContainer.fs.readFile(filePath, encoding)
		return content
	}

	writeLog(process: WebContainerProcess, term: TerminalIdentify) {
		process.output.pipeTo(
			new WritableStream({
				write: data => {
					const _firstTimeIndex = this._firstTimes.findIndex(f => f.id === term.id)
					term.t.write(data)

					if (this._firstTimes[_firstTimeIndex]?.state) {
						requestIdleCallback(() => sendEvent('terminal:ready'))
						this._firstTimes[_firstTimeIndex].state = false
					}
				},
			}),
		)
	}

	async startShell(idTerm: string) {
		const term = this._terminals.find(t => t.id === idTerm)
		const shellProcessIndex = this._shellProcesses.findIndex(s => s.id === idTerm)

		if (this._shellProcesses[shellProcessIndex]?.p) return
		if (!term) return

		this._shellProcesses[shellProcessIndex].p = await this._webContainer?.spawn('jsh', {
			terminal: {
				cols: term.t.cols,
				rows: term.t.rows,
			},
		})

		this._shellProcesses[shellProcessIndex]?.p && this.writeLog(this._shellProcesses[shellProcessIndex].p!, term)

		const shellInputIndex = this._shellInputs.findIndex(s => s.id === term.id)

		this._shellInputs[shellInputIndex].i = this._shellProcesses[shellProcessIndex]?.p?.input.getWriter()

		term.t.onData(data => {
			this._shellInputs[shellInputIndex]?.i?.write(data)
		})

		return this._shellProcesses[shellProcessIndex]
	}

	writeCommand(command: string, idTerm: string) {
		const term = this._terminals.find(t => t.id === idTerm)
		const shellInputIndex = this._shellInputs.findIndex(s => s.id === idTerm)

		term && term.t.write(command)
		this._shellInputs[shellInputIndex] && this._shellInputs[shellInputIndex]?.i?.write(command)
	}

	async runCommand(command: string, args: string[] = [], writeLog = false) {
		const term = this._terminals.find(t => t.id === this._activeTerm)
		const process = await this._webContainer.spawn(command, args)
		writeLog && term && this.writeLog(process, term)
		return process.exit
	}
}

const webContainerService = new WebContainerService()

export default webContainerService
