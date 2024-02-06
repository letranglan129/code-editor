import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import 'overlayscrollbars/overlayscrollbars.css'

type ScrollbarProps = {
	children?: React.ReactNode
	className?: string
}

export default function Scrollbar({ children, className = 'bg-[#1c1f25]', ...props }: ScrollbarProps) {
	return (
		<div className={`overflow-hidden h-full flex flex-col relative ${className}`} {...props}>
			<OverlayScrollbarsComponent
				options={{
					scrollbars: {
						autoHide: 'leave',
					},
				}}
				className="flex-1"
				defer
			>
				{children}
			</OverlayScrollbarsComponent>
		</div>
	)
}
