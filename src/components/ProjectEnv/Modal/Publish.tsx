import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import Scrollbar from '../../Scrollbar'
import TextBox from 'devextreme-react/text-box'
import { FileTreeNomarlizedType } from '../../../utils/types'
import Button from '../../Button'
import Steps from 'rc-steps'
import 'rc-steps/assets/index.css'
import { StepProps } from 'rc-steps/lib/Step'
import Accordion from '../../Accordion'
import { useToastStore } from '../../../store/ToastStore'
import { ToastVariant } from '../../Toast'
import { ProjectCodeStore, useProjectCodeStore } from '../../../store/projects'
import { observer } from 'mobx-react-lite'

type PublishProps = {
	handlePublish: (password: string) => void
	slug: string
	socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | null
	getPortsExpose: () => string[]
	projectCodeStore: ProjectCodeStore
}

const initSteps: StepProps[] = [
	{
		stepNumber: 1,
		title: 'Confirm',
		className: '!text-title',
		status: 'wait',
	},
	{ stepNumber: 2, title: 'Upload Source', className: '!text-title' },
	{ stepNumber: 3, title: 'Publish', className: '!text-title' },
]

export default observer(function Publish({
	handlePublish,
	slug,
	socket,
	getPortsExpose,
	projectCodeStore,
}: PublishProps) {
	const wrapMessageRef = useRef<HTMLDivElement>(null)
	const [messages, setMessages] = useState<string[]>([])
	const [steps, setSteps] = useState<StepProps[]>(structuredClone(initSteps))
	const [password, setPassword] = useState<string>('')
	const toastStore = useToastStore()

	useEffect(() => {
		const listener = ({ message }: { message: string }) => {
			if (typeof message === 'string') setMessages(prev => [...prev, message])
		}
		socket?.on(`run-sh-${slug}`, listener)

		socket?.on(`publish-status-${slug}`, ({ step, status }: { step: number } & Pick<StepProps, 'status'>) => {
			setSteps(prev => {
				const newSteps = [...prev]
				newSteps[step - 1].status = status
				return newSteps
			})
		})

		socket?.on(`updatePublishUrl-${slug}`, ({ publishUrl }: { publishUrl: string }) => {
			projectCodeStore.setPublishUrl(publishUrl)
		})

		return () => {
			socket?.off(`run-sh-${slug}`, listener)
			socket?.off(`publish-status-${slug}`, listener)
		}
	}, [socket])

	useEffect(() => {
		setTimeout(() => {
			wrapMessageRef.current?.scrollTo({
				behavior: 'smooth',
				top: wrapMessageRef.current?.scrollHeight,
			})
		}, 100)
	}, [messages])

	return (
		<Scrollbar className="bg-none">
			<Steps items={steps}></Steps>

			<div className="my-2">
				{projectCodeStore.project?.publishUrl && (
					<div>
						Your project has been published at the link:
						<a href={'https://' + projectCodeStore.project?.publishUrl} target="_blank">
							{projectCodeStore.project?.publishUrl}
						</a>
					</div>
				)}
				<div>Your project will be published on port: {getPortsExpose().join(', ')}</div>

				{(steps[0].status === 'wait' || steps.find(step => step.status === 'error')) && (
					<div>
						<input
							className="h-8 flex-shrink-0 border border-transparent bg-zinc-800 px-3 text-12 outline-none focus:border-blue-500"
							type="password"
							placeholder="Enter password"
							value={password}
							onChange={e => {
								setPassword(e.target.value)
							}}
						/>
						<Button
							className="ml-4 h-8"
							variant="pr"
							disabled={password === ''}
							onClick={() => {
								setMessages([])
								setSteps(prev => {
									let newSteps = [...prev]

									if (newSteps[newSteps.length - 1].status === 'error')
										newSteps = structuredClone(initSteps)

									newSteps[0].status = 'finish'
									newSteps[1].status = 'process'
									return newSteps
								})

								handlePublish(password)
							}}
						>
							Start publish
						</Button>
					</div>
				)}
			</div>
			<form className="py-4">
				{messages.length > 0 && (
					<Accordion open={true} handler={<p className="text-lg">Publish logs:</p>}>
						<div
							className="max-h-96 overflow-auto bg-neutral-800 px-2 [&>*]:pl-[50px] [&>*]:indent-[-50px]"
							ref={wrapMessageRef}
						>
							{messages.map((message, index) => (
								<div key={index}>{message}</div>
							))}
						</div>
					</Accordion>
				)}
			</form>
		</Scrollbar>
	)
})
