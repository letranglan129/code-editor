'use client'

// import { listenEvent, sendEvent } from '@/utils/events'
import { FSWatchOptions, WebContainer, WebContainerProcess } from '@webcontainer/api'
import debounce from 'lodash.debounce'
import { Terminal } from 'xterm'
import { listenEvent, sendEvent } from '../utils/events'

class WebContainerService {
	_webContainer!: WebContainer
	_terminal!: Terminal
	_shellInput!: WritableStreamDefaultWriter<string>
	_shellProcess!: WebContainerProcess

	constructor() {
		listenEvent('terminal-fit', () => {
			this._shellProcess &&
				this._shellProcess.resize({
					cols: this._terminal.cols,
					rows: this._terminal.rows,
				})
		})
	}

	setWebContainer(webContainer: WebContainer) {
		this._webContainer = webContainer
	}

	setTerminal(terminal: Terminal) {
		this._terminal = terminal
	}

	getWebContainer() {
		return this._webContainer
	}

	getTerminal() {
		return this._terminal
	}

	writeFile = debounce(async (filePath, content) => {
		if (!this._webContainer) return
		await this._webContainer.fs.writeFile(filePath, content)
	}, 800)

	watchFile(filePath: string, callback?: FSWatchOptions) {
		if (!this._webContainer) return
		return this._webContainer.fs.watch(filePath, callback)
	}

	async readFile(filePath: string) {
		if (!this._webContainer) return
		const content = await this._webContainer.fs.readFile(filePath, 'utf-8')
		return content
	}

	_firstTime = true

	writeLog(process: WebContainerProcess) {
		process.output.pipeTo(
			new WritableStream({
				write: data => {
					this._terminal.write(data)

					if (this._firstTime) {
						requestIdleCallback(() => sendEvent('terminal:ready'))
						this._firstTime = false
					}
				},
			}),
		)
	}

	async startShell() {
		if (this._shellProcess) return
		
		this._shellProcess = await this._webContainer.spawn('jsh', {
			terminal: {
				cols: this._terminal.cols,
				rows: this._terminal.rows,
			},
		})
		this.writeLog(this._shellProcess)

		this._shellInput = this._shellProcess.input.getWriter()
		this._terminal.onData(data => {
			this._shellInput.write(data)
		})

		return this._shellProcess
	}

	writeCommand(command: string) {
		this._terminal && this._terminal.write(command)
		this._shellInput && this._shellInput.write(command)
	}

	async runCommand(command: string, args: string[] = [], writeLog = false) {
		const process = await this._webContainer.spawn(command, args)
		writeLog && this.writeLog(process)
		return process.exit
	}
}

const webContainerService = new WebContainerService()

export default webContainerService
