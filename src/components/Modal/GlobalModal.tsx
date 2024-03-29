import { observer } from 'mobx-react-lite'
import React from 'react'
import { useModalStore } from '../../store/modalStore'
import { isFunction } from '../../utils'
import Modal from '../Modal'

export declare interface GlobalModalProps extends React.HTMLProps<HTMLDivElement> {}

export default observer(function GlobalModal() {
	const { isOpen, close, content, modalProps } = useModalStore()

	return (
		<Modal open={isOpen} onClose={close} {...modalProps}>
			{isFunction(content) ? (content as Function)() : content}
		</Modal>
	)
})
