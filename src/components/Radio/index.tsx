import React from 'react'

export type RadioProps = React.InputHTMLAttributes<HTMLInputElement>

export default function Radio({ className = '', ...props }: RadioProps) {
	return (
		<input
			type="radio"
			className={`mt-0.5 shrink-0 rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:checked:border-blue-500 dark:checked:bg-blue-500 bg-transparent dark:focus:ring-offset-gray-800 ${className}`}
			{...props}
		/>
	)
}
