import { isSameOrigin, isUrlValid } from '@/utils/strings'
import { KeyboardEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FaArrowRotateRight } from 'react-icons/fa6'
import { useWebContainer } from '../../../contexts/WebContainer/hooks'
import webContainerService from '../../../services/WebContainerService'
import { listenEvent } from '../../../utils/events'
import { Port } from '../../../utils/types'

export type BrowserRef = {
	openNewTab: () => void
}

let originUrl: string = ''

const Browser = forwardRef<BrowserRef, { isResizing: boolean }>(function Browser({ isResizing }, ref) {
	const iframeRef = useRef<HTMLIFrameElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const [url, setUrl] = useState('')
	const [urlTmp, setUrlTmp] = useState('')

	const { webContainer } = useWebContainer()

	useEffect(() => {
		if (webContainer) {
			webContainer.on('server-ready', (port, url) => {})

			webContainer.on('port', (port, type, url) => {
				if (type === 'open') {
					webContainerService.addPort({ port, url })
					if (webContainerService.getPortActive() === null) webContainerService.setPortActive({ port, url })
					return
				}

				webContainerService.removePort(port)
			})
		}
	}, [webContainer, webContainerService])

	useEffect(() => {
		const portActive = webContainerService.getPortActive()
		if (portActive) {
			setUrl(portActive.url)
			setUrlTmp(portActive.url)
		}
		const remove = listenEvent('web-container:active-port', ({ detail }: { detail: Port }) => {
			if (iframeRef.current) {
				iframeRef.current.src = detail.url
			}

			setUrl(detail.url)
			setUrlTmp(detail.url)
		})

		return remove
	}, [])

	const access = (url: string) => {
		if (iframeRef.current) iframeRef.current.src = url
		setUrlTmp(url)
	}

	useEffect(() => {
		access(url)
	}, [url])

	const handleReload = () => {
		access(url)
	}

	const handleAccess = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			if (!isUrlValid(urlTmp)) return

			if (isSameOrigin(url, urlTmp)) {
				setUrl(urlTmp)

				if (url === urlTmp) {
					handleReload()
				}
			}
			// Reset the previous url, if the user enters a cross domain.
			else {
				setUrlTmp(url)
			}

			// Always blur from input after pressing enter.
			inputRef.current && inputRef.current.blur()
		}
	}

	useImperativeHandle(ref, () => ({
		openNewTab: () => {
			window.open(url, '_blank')
		},
	}))

	return (
		<div className={`h-full ${isResizing ? 'pointer-events-none' : ''}`}>
			<div className="flex h-10 bg-black px-3">
				<button className="flex h-10 w-10 items-center justify-center" onClick={handleReload}>
					<FaArrowRotateRight />
				</button>
				<div className="flex flex-1 py-1">
					<input
						ref={inputRef}
						type="text"
						value={urlTmp}
						onChange={e => {
							setUrlTmp(e.target.value)
						}}
						className="h-full w-full text-ellipsis whitespace-nowrap rounded-full border-2 border-transparent bg-neutral-900 px-3 py-1 text-13 outline-none hover:border-gray-500 focus:border-sky-600"
						onKeyDown={handleAccess}
					/>
				</div>
			</div>
			<iframe
				ref={iframeRef}
				className={'h-full w-full'}
				src={url}
				referrerPolicy="origin"
				title="Preview"
				allow="geolocation; microphone; camera; payment; autoplay; serial; cross-origin-isolated"
			/>
		</div>
	)
})

export default Browser
