'use client'

import { useEffect, useReducer, useRef, useState } from 'react'

import { useCompletion } from 'ai/react'
import { LlamaTemplate } from '../../../utils/llama/llamaTemplate'
import { countTokens } from '../../../utils/llama/tokenizer'
import { MessageReplicate, MessageReplicateTemplate } from '../../../utils/types'

const llamaTemplate = LlamaTemplate()

const generatePrompt = (template: (chat: MessageReplicateTemplate[]) => string, messages: MessageReplicate[]) => {
	const chat = messages.map(message => ({
		role: message.isUser ? 'user' : 'assistant',
		content: message.text,
	}))

	return template([
		{
			role: 'system',
			content: 'Welcome to the chat! How can I help you today?',
		},
		...chat,
	])
}


const ChatForm = ({ prompt, setPrompt, onSubmit, completion }: {
	prompt: string
	setPrompt: (value: string) => void
	onSubmit: (value: string) => void
	completion: string
}) => {
	const handleSubmit = async event => {
		event.preventDefault()
		onSubmit(prompt)
		setPrompt('')
		event.target.rows = 1
	}

	const handleKeyDown = event => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSubmit(event)
		}
	}

	return (
		<footer className="fixed bottom-0 left-0 right-0 z-10 border-t-2 bg-slate-100">
			<div className="container mx-auto max-w-2xl px-5 pb-8">
				<form className="flex w-full" onSubmit={handleSubmit}>
					<textarea
						autoComplete="off"
						autoFocus
						name="prompt"
						className="block w-full flex-grow rounded-l-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:leading-6"
						placeholder="Send a message"
						required={true}
						value={prompt}
						rows={1}
						onChange={e => setPrompt(e.target.value)}
						onKeyDown={handleKeyDown}
						onInput={e => {
							const lineCount = e.target.value.split('\n').length
							e.target.rows = lineCount > 10 ? 10 : lineCount
						}}
					/>
					<button
						className="items-center rounded-r-md bg-gray-600 px-5 py-3 font-semibold text-white hover:bg-gray-800"
						type="submit"
					>
						Chat
					</button>
				</form>
			</div>
		</footer>
	)
}
const Message = ({ message, isUser }: {message: string, isUser: boolean}) => {
	let containerClass = 'bg-gray-50'
	if (isUser) {
		containerClass = ''
	}

	if (Array.isArray(message)) {
		message = message.join('')
	}

	if (!message || message === '') {
		return null
	}

	return (
		<div className={`flex gap-x-4 rounded-md ${containerClass} mb-12 px-5 py-5`}>
			{isUser ? (
				<span className="text-xl sm:text-2xl" title="user">
					🥸
				</span>
			) : (
				<span className="text-xl sm:text-2xl" title="AI">
					🦙
				</span>
			)}

			<div className="mt-1 flex flex-1 flex-col gap-y-4 text-sm sm:text-base text-black">
				{message.split('\n').map(
					(text, index) =>
						text.length > 0 && (
							<span key={index} className="min-w-0">
								{text}
							</span>
						),
				)}
			</div>
		</div>
	)
}

const QueuedSpinner = () => {
	return (
		<div className="inline-flex items-center px-5" role="status">
			<div>
				<svg
					aria-hidden="true"
					className="h-8 w-8 animate-spin fill-gray-600 text-gray-200"
					viewBox="0 0 100 101"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
						fill="currentColor"
					/>
					<path
						d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
						fill="currentFill"
					/>
				</svg>
			</div>
			<p className="pl-3 text-gray-500">Queued...</p>
		</div>
	)
}

export default function HomePage() {
	const MAX_TOKENS = 4096
	const bottomRef = useRef<HTMLDivElement>(null)
	const [messages, setMessages] = useState<MessageReplicate[]>([])
	const [open, setOpen] = useState(false)
	const [error, setError] = useState('')
	const [starting, setStarting] = useState(false)

	const { complete, completion, setInput, input } = useCompletion({
		api: '/api/predictions',
		body: {
			maxTokens: 1000000000,
			temperature: 0.5,
			topP: 1,
		},
		onError: error => {
			setError(error.message)
		},
		onResponse: response => {
			setStarting(false)
			setError('')
		},
		onFinish: () => {
			setStarting(false)
		},
	})

	const handleSubmit = async (userMessage: string) => {
		setStarting(true)
		const SNIP = '<!-- snip -->'

		const messageHistory = [...messages]
		if (completion.length > 0) {
			messageHistory.push({
				text: completion,
				isUser: false,
			})
		}
		messageHistory.push({
			text: userMessage,
			isUser: true,
		})

		// Generate initial prompt and calculate tokens
		let prompt = `${generatePrompt(llamaTemplate, messageHistory)}\n`
		// Check if we exceed max tokens and truncate the message history if so.
		while (countTokens(prompt) > MAX_TOKENS) {
			if (messageHistory.length < 3) {
				setError('Your message is too long. Please try again with a shorter message.')

				return
			}

			// Remove the third message from history, keeping the original exchange.
			messageHistory.splice(1, 2)

			// Recreate the prompt
			prompt = `${SNIP}\n${generatePrompt(llamaTemplate, messageHistory)}\n`
		}

		setMessages(messageHistory)

		complete(prompt)
	}

	useEffect(() => {
		if (messages?.length > 0 || completion?.length > 0) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [messages, completion])

	return (
		<>
			<main className="mx-auto mt-4 max-w-2xl pb-5 sm:px-4">
				<div className="text-center"></div>

				<ChatForm prompt={input} setPrompt={setInput} onSubmit={handleSubmit} completion={completion} />

				{error && <div>{error}</div>}

				<article className="pb-24">
					{messages.map((message, index) => (
						<Message key={`message-${index}`} message={message.text} isUser={message.isUser} />
					))}
					<Message message={completion} isUser={false} />

					{starting && <QueuedSpinner />}

					<div ref={bottomRef} />
				</article>
			</main>
		</>
	)
}
