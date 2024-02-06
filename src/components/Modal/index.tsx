import cx from '../../utils/makeCls'
import Icon from '@mdi/react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef } from 'react'
import { mdiClose } from '@mdi/js'
import { br, cl, ts } from '../theme'
import Button, { ButtonProps } from '../Button'
import Grid from '../Grid'
import ButtonWithTooltip from '../Button/ButtonWithTooltip'

export declare interface ModalProps {
	children: React.ReactNode
	className?: string
	open?: boolean
	title?: React.ReactNode
	description?: React.ReactNode
	buttons?: ButtonProps[]
	large?: boolean
	fullH?: boolean
	closable?: boolean
	size?: 'l' | 'm' | 's'
	onClose(value?: boolean): void
}

export default function Modal({
	open = false,
	title,
	description,
	children,
	onClose,
	closable = true,
	fullH,
	buttons = [],
	size,
}: ModalProps) {
	const closeModal = () => closable && onClose()
	const clsDialog = cx([
		'relative w-full p-5 my-8 shadow-xl rounded-xl flex flex-col max-h-[calc(100vh_-_100px)] overflow-hidden',
		br.b,
		cl.br,
		cl.bg,
		cl.txt,
		size === 'l' ? 'max-w-6xl' : size === 's' ? 'max-w-sm' : 'max-w-md',
	])

	return (
		<Transition show={open} as={Fragment}>
			<Dialog onClose={closeModal} className="fixed inset-0 z-50 overflow-y-auto" static>
				<div className={cx('flex min-h-screen justify-center', fullH ? 'items-stretch' : 'items-center')}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-100"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Dialog.Overlay className="fixed inset-0 bg-black/50 transition-opacity" />
					</Transition.Child>

					<Transition.Child as={Fragment} {...ts}>
						<div className={clsDialog}>
							{closable && (
								<div className="absolute right-0 top-0 m-3">
									<ButtonWithTooltip block border={false} onClick={closeModal}>
										<Icon path={mdiClose} size={1} />
									</ButtonWithTooltip>
								</div>
							)}
							<Dialog.Title as="h3" className="text-lg font-medium leading-6">
								{title}
							</Dialog.Title>
							<Dialog.Description>{description}</Dialog.Description>
							<Dialog.Panel className="mt-4 h-full overflow-auto">{children}</Dialog.Panel>
							{buttons.length > 0 && (
								<Grid className="mt-4" space="m" items="center" justify="end">
									{buttons.map((button, i) => (
										<Button key={i} {...button} />
									))}
								</Grid>
							)}
						</div>
					</Transition.Child>
					{/* a weird trick to prevent the dialog closing on outside within toast click... */}
					<Dialog onClose={() => {}}></Dialog>
				</div>
			</Dialog>
		</Transition>
	)
}
