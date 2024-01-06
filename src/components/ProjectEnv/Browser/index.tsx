import { isSameOrigin, isUrlValid } from '@/utils/strings'
import { KeyboardEvent, memo, useEffect, useRef, useState } from 'react'
import { FaArrowRotateRight } from 'react-icons/fa6'
import { toast } from 'react-toastify'
import { useWebContainer } from '../../../contexts/WebContainer/hooks'

const Browser = memo<{ isResizing: boolean }>(function Browser({ isResizing }) {
	const iframeRef = useRef<HTMLIFrameElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const [url, setUrl] = useState('')
	const [urlTmp, setUrlTmp] = useState('')
	const originUrlRef = useRef('')

	const { webContainer } = useWebContainer()

	useEffect(() => {
		if (webContainer) {
			webContainer.on('server-ready', (port, url) => {
				if (iframeRef.current) {
					iframeRef.current.src = url
				}
				if (originUrlRef.current) originUrlRef.current = url
				setUrl(url)
				setUrlTmp(url)
			})
		}
	}, [webContainer])

	const access = (url: string) => {
		if (iframeRef.current) iframeRef.current.src = url
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

			if (isSameOrigin(originUrlRef.current, urlTmp)) {
				setUrl(urlTmp)

				// Reload when entering the input without changing the url.
				if (url === urlTmp) {
					handleReload()
				}
			}
			// Reset the previous url, if the user enters a cross domain.
			else {
				toast.error('Cross-domains are not accessible', { autoClose: 1500 })
			}

			// Always blur from input after pressing enter.
			inputRef.current && inputRef.current.blur()
		}
	}

	return (
		<div className={`h-full ${isResizing ? 'pointer-events-none' : ''}`}>
			<div className="flex px-3 bg-black h-10">
				<button className="h-10 w-10 flex items-center justify-center">
					<FaArrowRotateRight />
				</button>
				<div className="flex-1 py-1 flex">
					<input
						ref={inputRef}
						type="text"
						value={url}
						onChange={(e) => {}}
						className="h-full w-full text-13 whitespace-nowrap text-ellipsis rounded-full outline-none border-2 px-3 py-1 border-transparent hover:border-gray-500 focus:border-sky-600 bg-neutral-900"
						onKeyDown={e => handleAccess}
					/>
				</div>
			</div>
			<iframe
				ref={iframeRef}
				className={'w-full h-full bg-white'}
				src={url}
				referrerPolicy="origin"
				title="Preview"
				allow="geolocation; microphone; camera; payment; autoplay; serial; cross-origin-isolated"
			/>
		</div>
	)
})

export default Browser
