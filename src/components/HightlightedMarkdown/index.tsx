import React, { useRef, useEffect } from 'react'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

interface HighlightedMarkdownProps {
	children: string
	className?: string
}

export function HighlightedMarkdown({ children, className = '' }: HighlightedMarkdownProps) {
	const rootRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		rootRef.current?.querySelectorAll('pre code').forEach(block => {
			hljs.highlightBlock(block as HTMLElement)
		})
	}, [children])

	return (
		<div ref={rootRef} className={className}>
			<Markdown>{children}</Markdown>
		</div>
	)
}
