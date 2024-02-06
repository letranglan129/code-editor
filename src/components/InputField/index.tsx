import { useState, KeyboardEvent, useEffect } from 'react'
import Grid from '../Grid'
import GridItem from '../GridItem'
import { pad, br, cl, elStyles } from '../theme'
import cx from '../../utils/makeCls'
import { isDef } from '../../utils/types'
import LabelField from '../LabelField'

export interface InputFieldProps {
	className?: string
	value: string
	placeholder?: string
	required?: boolean
	label?: React.ReactNode
	size?: 'm' | 's'
	type?: string
	isTextarea?: boolean
	inputAttributes?: React.InputHTMLAttributes<HTMLInputElement>
	textareaAttributes?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
	onInput?(value: string): void
	onChange?(value: string, partial?: boolean): void
}

const getValue = (value: string) => (isDef(value) ? value : '')

export const getInputClassName = () => {
	return cx('w-full placeholder:italic', cl.bgTr, elStyles.inputText)
}

export default function InputField<T>({
	className,
	value,
	label,
	size = 'm',
	type,
	placeholder,
	required,
	isTextarea = false,
	inputAttributes = {},
	textareaAttributes = {},
	onInput,
	onChange,
}: InputFieldProps) {
	const [stateValue, setStateValue] = useState(getValue(value))
	const classInput = getInputClassName()

	useEffect(() => {
		setStateValue(getValue(value))
	}, [value])

	useEffect(() => {
		onInput?.(stateValue)
	}, [stateValue])

	const handleChange = (value: string, partial?: boolean) => {
		onChange?.(value, partial)
	}

	const handleKeyDown = (ev: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { key } = ev

		switch (key) {
			case 'Escape':
				return setStateValue(value)
			case 'Enter':
				return handleChange(stateValue)
		}
	}

	const handleBlur = (ev: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		handleChange(stateValue)
	}

	return (
		<div className={cx(className)}>
			{!!label && <LabelField size={size}>{label}</LabelField>}
			<Grid
				className={cx(
					cl.bg,
					br.b,
					br.rnd,
					cl.br,
					size === 'm' && pad.xy,
					size === 's' && 'px-3 py-1',
					'focus-within:border-sky-600',
				)}
				items="center"
				space="x2s"
			>
				<GridItem grow>
					{isTextarea ? (
						<textarea
							className={classInput}
							value={stateValue}
							onChange={ev => setStateValue(ev.target.value)}
							placeholder={placeholder}
							required={required}
							rows={3}
							onBlur={handleBlur}
							onKeyDown={handleKeyDown}
							{...textareaAttributes}
						/>
					) : (
						<input
							className={classInput}
							value={stateValue}
							onChange={ev => setStateValue(ev.target.value)}
							placeholder={placeholder}
							required={required}
							onBlur={handleBlur}
							onKeyDown={handleKeyDown}
							type={type}
							{...inputAttributes}
						/>
					)}
				</GridItem>
			</Grid>
		</div>
	)
}
