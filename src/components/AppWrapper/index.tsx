import React from 'react'
import { cx } from '../../utils/makeCls'
import PointerBadge from '../PointerBadge'
import { cl } from '../theme'

export declare interface AppWrapperProps extends React.HTMLProps<HTMLDivElement> {}

export default function AppWrapper({ children }: AppWrapperProps) {
	return (
		<div className={cx('h-screen text-base', cl.txt)}>
			{children}
			<PointerBadge />
		</div>
	)
}
