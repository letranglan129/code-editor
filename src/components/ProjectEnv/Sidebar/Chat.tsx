import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { MessageReplicate, MessageReplicateTemplate } from '../../../utils/types'
import { useCompletion } from 'ai/react'
import { countTokens } from '../../../utils/llama/tokenizer'
import { LlamaTemplate } from '../../../utils/llama/llamaTemplate'
import { VscHubot, VscLoading, VscPerson, VscSend } from 'react-icons/vsc'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'

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

const ChatForm = ({
	starting,
	prompt,
	setPrompt,
	onSubmit,
}: {
	prompt: string
	setPrompt: (value: string) => void
	onSubmit: (value: string) => void
	starting: boolean
}) => {
	const handleSubmit = async (event: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
		event.preventDefault()
		onSubmit(prompt)
		setPrompt('')

		if (event.target instanceof HTMLTextAreaElement) event.target.rows = 1
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSubmit(event)
		}
	}

	return (
		<footer className="absolute bottom-0 left-0 right-0 z-10 bg-zinc-900">
			<div className="container mx-auto max-w-2xl px-5 pb-6">
				<form className="flex w-full" onSubmit={handleSubmit}>
					<textarea
						autoComplete="off"
						autoFocus
						name="prompt"
						className="m-0 max-h-52 max-h-[25dvh] w-full resize-none rounded-l-md  border-neutral-700 bg-transparent py-[10px] pl-3 pr-10 placeholder-black/50 shadow-border-gray outline-none focus:shadow-border-blue focus:ring-0 focus-visible:ring-0 md:py-3.5 md:pl-4 md:pr-12 dark:bg-transparent dark:placeholder-white/50"
						placeholder="Send a message"
						required={true}
						value={prompt}
						rows={1}
						disabled={starting}
						onChange={e => setPrompt(e.target.value)}
						onKeyDown={handleKeyDown}
						onInput={e => {
							e.currentTarget.style.height = 'auto'
							e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
						}}
					/>
					<button
						className="items-center rounded-r-md bg-gray-600 px-5 py-3 font-semibold text-white hover:bg-gray-800"
						type="submit"
						disabled={starting}
					>
						{starting ? <VscLoading className="flex-shrink-0 animate-spin text-lg" /> : <VscSend />}
					</button>
				</form>
			</div>
		</footer>
	)
}

const Message = ({ message, isUser }: { message: string; isUser: boolean }) => {
	if (Array.isArray(message)) {
		message = message.join('')
	}

	if (!message || message === '') {
		return null
	}
	console.log(message)
	return (
		<div className={`flex gap-x-4 overflow-hidden rounded-md py-4 ${isUser ? '' : 'pb-12'}`}>
			{isUser ? (
				<span
					className="flex h-8 w-8 items-center justify-center rounded-full bg-red-700 text-3xl text-white"
					title="user"
				>
					<VscPerson />
				</span>
			) : (
				<span
					className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-3xl text-white"
					title="AI"
				>
					<VscHubot />
				</span>
			)}

			<div className="mt-1 flex-1 gap-y-4 overflow-hidden text-15 leading-7 text-black">
				<Markdown
					rehypePlugins={[
						[
							rehypeHighlight,
							{
								detect: true,
							},
						],
					]}
				>
					{message}
				</Markdown>
			</div>
		</div>
	)
}

const QueuedSpinner = () => {
	return <VscLoading className="flex-shrink-0 animate-spin text-lg" />
}

export default function Chat() {
	const MAX_TOKENS = 4096
	const bottomRef = useRef<HTMLDivElement>(null)
	const [messages, setMessages] = useState<MessageReplicate[]>([])
	const [open, setOpen] = useState(false)
	const [error, setError] = useState('')
	const [starting, setStarting] = useState(false)

	const { complete, completion, setInput, input } = useCompletion({
		api: '/api/predictions',
		body: {
			maxTokens: 1000,
			temperature: 0.75,
			systemPrompt: 'You are a helpful assistant.',
			topP: 0.9,
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
		<main className="relative mx-auto flex h-full w-full overflow-auto">
			<div className="text-center"></div>
			{error && <div>{error}</div>}
			<article className="h-full flex-1 overflow-auto px-4 pb-12">
				{messages.map((message, index) => (
					<Message key={`message-${index}`} message={message.text} isUser={message.isUser} />
				))}
				<Message message={completion} isUser={false} />

				<div className="inline-flex items-center px-5" role="status">
					{starting && <QueuedSpinner />}
				</div>

				<div ref={bottomRef} />
			</article>{' '}
			<ChatForm starting={starting} prompt={input} setPrompt={setInput} onSubmit={handleSubmit} />
		</main>
	)
}
