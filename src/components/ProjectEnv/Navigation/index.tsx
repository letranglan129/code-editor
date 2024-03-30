import axios from 'axios'
import { observer } from 'mobx-react-lite'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, forwardRef, memo, useCallback, useEffect, useImperativeHandle } from 'react'
import {
	VscChevronDown,
	VscLayoutSidebarRight,
	VscLayoutSidebarRightOff,
	VscLiveShare,
	VscLoading,
	VscLock,
	VscRepoForked,
	VscSave,
	VscUnlock,
} from 'react-icons/vsc'
import { useSocket } from '../../../contexts/SocketIO/hooks'
import { useWebContainer } from '../../../contexts/WebContainer/hooks'
import { useLoading } from '../../../hooks/useLoading'
import EarthNetwork from '../../../icons/EarthNetwork'
import lang from '../../../locale/en'
import projectService from '../../../services/ProjectSerivce'
import { useToastStore } from '../../../store/ToastStore'
import { useModalStore } from '../../../store/modalStore'
import { useProjectCodeStore } from '../../../store/projects'
import { isPermissionCoOwner, isPermissionEdit } from '../../../utils/permission'
import { findPortDockerfile } from '../../../utils/port'
import { convertArrayToNestedTree, convertContainerFiles } from '../../../utils/trees'
import { FileTreeNomarlizedType, VisibilityState } from '../../../utils/types'
import InputField from '../../InputField'
import Popover from '../../Popover'
import Radio from '../../Radio'
import { ToastVariant } from '../../Toast'
import { BrowserRef } from '../Browser'
import Publish from '../Modal/Publish'
import Share from '../Modal/Share'

export type NavigationRef = {
	handleSaveProject: () => Promise<void>
	forkProject: () => Promise<boolean>
}

export type NavigationProps = Pick<BrowserRef, 'openNewTab'> & {
	toggleBrowser: () => void
	isOpenBrowser: boolean
	onPreview: (file: FileTreeNomarlizedType) => void
}

export default memo(
	observer(
		forwardRef<any, NavigationProps>(function Navigation(
			{ openNewTab, toggleBrowser, isOpenBrowser, onPreview },
			ref,
		) {
			const { data: session, status } = useSession()
			const projectCodeStore = useProjectCodeStore()
			const { webContainer } = useWebContainer()
			const { socket } = useSocket()
			const modalStore = useModalStore()
			const toastStore = useToastStore()

			const [handleSaveProject, isLoadingSave] = useLoading(async () => {
				if (!projectService.currentProject?._id) return

				const data = convertArrayToNestedTree(Object.values(projectService.getEntriesNomalized()))

				await axios.post(`/api/projects/${projectCodeStore.project?.slug}/save`, {
					projectData: data,
				})
			}, [projectCodeStore.project])

			useEffect(() => {
				if (webContainer) {
					webContainer.on('server-ready', (port, url) => {})
				}
			}, [webContainer])

			const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
				e.preventDefault()
				try {
					await axios.patch(`/api/projects/${projectCodeStore.project?.slug}`, {
						title: projectCodeStore.project?.title,
						description: projectCodeStore.project?.description,
						visibility: projectCodeStore.project?.visibility,
						...(projectCodeStore.slugTmp === projectCodeStore.project?.slug
							? {}
							: { slug: projectCodeStore.slugTmp }),
					})

					toastStore.add('change_project', {
						header: 'Save success',
						variant: ToastVariant.Success,
						content: 'Project has been saved',
					})

					if (projectCodeStore.project) {
						projectCodeStore.project.slug = projectCodeStore.slugTmp
						history.replaceState(null, '', `/projects/${projectCodeStore.slugTmp}`)
					}
				} catch (error) {
					if (axios.isAxiosError(error) && error.response)
						toastStore.add('change_project', {
							header: 'Save error',
							variant: ToastVariant.Error,
							content: error.response.data.error,
						})
				}
			}

			const getPortsExpose = useCallback(() => {
				const dockerfile = projectService.getEntryFromPath('dockerfile')

				if (!dockerfile) return []

				return findPortDockerfile(dockerfile.content!)
			}, [projectCodeStore.fileEntries])

			const handlePublish = useCallback(
				(password: string) => {
					const fileNestedTree = convertArrayToNestedTree(Object.values(projectService.getEntriesNomalized()))
					const dockerfile = projectService.getEntryFromPath('dockerfile')
					
					if (!dockerfile) {
						toastStore.add('not-dockerfile', {
							header: 'Not found "dockerfile"',
							content: 'Create and write dockerfile production for your project',
							autoHideTimeout: 5000,
							variant: ToastVariant.Error
						})
					}
						
					const exposedPorts = findPortDockerfile(dockerfile.content!)

					socket?.emit('run-sh', {
						email: session?.user?.email,
						password,
						files: { ...convertContainerFiles(fileNestedTree) },
						ports: exposedPorts,
						slug: projectCodeStore.project?.slug,
					})
				},
				[projectCodeStore.fileEntries],
			)

			const handleRemove = useCallback(() => {
				socket?.emit('uninstall-web', {
					slug: projectCodeStore.project?.slug,
				})
			}, [projectCodeStore.fileEntries])

			const [forkProject, isLoadingFork] = useLoading(async () => {
				try {
					const { data } = await axios.get(`/api/projects/${projectCodeStore.project?.slug}/clone`)

					if (projectCodeStore.project) {
						projectCodeStore.project.slug = data.slug
						projectCodeStore.project.uuid = data.uuid
						projectCodeStore.project._id = data._id
						projectCodeStore.project.project_id = data.project_id
						projectCodeStore.project.created_at = data.created_at
						projectCodeStore.project.updated_at = data.updated_at
					}

					window.history.replaceState(null, '', `/projects/${projectCodeStore.project?.slug}`)
					toastStore.add('fork-complete', {
						header: 'Forked',
						variant: ToastVariant.Success,
						content: 'Project has been forked',
					})

					return true
				} catch (error) {
					toastStore.add('fork-error', {
						header: 'Fork error',
						variant: ToastVariant.Error,
						content: 'Project has not been forked',
					})
					return false
				}
			}, [projectCodeStore.project?.slug, projectCodeStore.project?.uuid])

			useImperativeHandle(
				ref,
				() => ({
					handleSaveProject,
					forkProject,
				}),
				[forkProject, handleSaveProject],
			)

			return (
				<div className="flex h-12 w-full flex-shrink-0 bg-zinc-800">
					<Link href="/dashboard" className="flex aspect-square h-full items-center justify-center">
						<Image src="/logo.svg" width={24} height={24} alt="" className="rounded-md" />
					</Link>
					{(session?.user.id === projectCodeStore.project?.uuid?._id ||
						isPermissionEdit(projectCodeStore.project?.permissions || [], session?.user.id)) && (
						<button
							className="flex h-full items-center justify-center gap-1 px-2.5 text-12 text-gray-300 hover:bg-neutral-700 hover:bg-opacity-50"
							onClick={handleSaveProject}
						>
							{isLoadingSave ? (
								<VscLoading className="flex-shrink-0 animate-spin text-lg" />
							) : (
								<VscSave className="flex-shrink-0 text-lg" />
							)}
							Save
						</button>
					)}
					{(session?.user.id === projectCodeStore.project?.uuid?._id ||
						isPermissionCoOwner(projectCodeStore.project?.permissions || [], session?.user.id)) && (
						<button
							className="flex h-full items-center justify-center gap-1 px-2.5 text-12 text-gray-300 hover:bg-neutral-700 hover:bg-opacity-50"
							onClick={() => {
								modalStore.open({
									content: <Share projectCodeStore={projectCodeStore} />,
									title: 'Share',
									size: 'l',
								})
							}}
						>
							<VscLiveShare className="flex-shrink-0 text-lg" /> Share
						</button>
					)}
					<button
						className="flex h-full items-center justify-center gap-1 px-2.5 text-12 text-gray-300 hover:bg-neutral-700 hover:bg-opacity-50"
						onClick={forkProject}
					>
						<VscRepoForked className="flex-shrink-0 text-lg" /> Fork
					</button>
					{/* {(session?.user.id === projectCodeStore.project?.uuid?._id ||
						isPermissionCoOwner(projectCodeStore.project?.permissions || [], session?.user.id)) &&
						projectCodeStore.project?.isDeploy && (
							<button
								className="flex h-full items-center justify-center gap-1 px-2.5 text-12 text-gray-300 hover:bg-neutral-700 hover:bg-opacity-50"
								onClick={handleRemove}
							>
								<VscRepoForked className="flex-shrink-0 text-lg" /> Remove Deploy
							</button>
						)} */}
					{(session?.user.id === projectCodeStore.project?.uuid?._id ||
						isPermissionCoOwner(projectCodeStore.project?.permissions || [], session?.user.id)) &&
						projectCodeStore.project?.isDeploy && (
							<button
								className="flex h-full items-center justify-center gap-1 px-2.5 text-12 text-gray-300 hover:bg-neutral-700 hover:bg-opacity-50"
								onClick={async () => {
									modalStore.open({
										content: (
											<Publish
												socket={socket}
												handlePublish={handlePublish}
												getPortsExpose={getPortsExpose}
												slug={projectCodeStore.project?.slug!}
												projectCodeStore={projectCodeStore}
											/>
										),
										title: lang.createProject,
										onClose() {
											modalStore.close()
											modalStore.clear()
										},
									})
								}}
							>
								<EarthNetwork className="h-[15px] w-[15px] flex-shrink-0 fill-gray-300" /> Publish
							</button>
						)}

					<div className="mx-auto flex items-center">
						<button className='"flex h-full items-center justify-center px-2'>
							<Image src="/logo.svg" width={24} height={24} alt="" className="rounded-full" />
						</button>
						<label className="input-sizer mx-2" data-value={projectCodeStore.project?.title || ''}>
							<input
								type="text"
								data-
								onInput={e => {
									if (e.currentTarget?.parentNode)
										// @ts-ignore
										e.currentTarget.parentNode.dataset.value = e.currentTarget.value
								}}
								size={1}
								disabled={
									!(
										session?.user.id === projectCodeStore.project?.uuid?._id ||
										isPermissionCoOwner(
											projectCodeStore.project?.permissions || [],
											session?.user.id,
										)
									)
								}
								placeholder=""
								maxLength={50}
								value={projectCodeStore.project?.title || ''}
								onChange={e => {
									projectCodeStore.setTitle(e.target.value)
								}}
							/>
						</label>
						{(session?.user.id === projectCodeStore.project?.uuid?._id ||
							isPermissionCoOwner(projectCodeStore.project?.permissions || [], session?.user.id)) && (
							<Popover
								handler={
									<div className="flex h-full items-center justify-center px-2 text-lg text-gray-300">
										{projectCodeStore.project?.visibility === 'private' ? (
											<VscLock />
										) : (
											<VscUnlock />
										)}{' '}
										<VscChevronDown className="ml-1" />
									</div>
								}
								title={false}
								padding={false}
								overlay
							>
								<div className="bg-neutral-800 p-4">
									<form onSubmit={handleSubmit} className="flex flex-col gap-4 text-13">
										<label>
											<p>Title</p>
											<InputField
												size="s"
												type="search"
												value={projectCodeStore.project?.title || ''}
												onInput={e => {
													projectCodeStore.setTitle(e)
												}}
												placeholder={`Title...`}
												className="text-13"
											/>
										</label>
										<label>
											<p>Description</p>
											<InputField
												size="s"
												type="search"
												value={projectCodeStore.project?.description || ''}
												onInput={e => {
													projectCodeStore.setDesc(e)
												}}
												placeholder={`Description...`}
												className="text-13"
												isTextarea={true}
												textareaAttributes={{
													rows: 4,
													style: { resize: 'none' },
												}}
											/>
										</label>
										<label>
											<p>Project URL</p>
											<InputField
												size="s"
												type="search"
												value={projectCodeStore.slugTmp || ''}
												onInput={e => {
													projectCodeStore.setSlug(e)
												}}
												placeholder={`Title...`}
												className="text-13"
											/>
										</label>
										<div>
											<p>Visibility</p>
											<div className="mb-4 flex items-center">
												<Radio
													name="visibility"
													id="visibility-public"
													value={VisibilityState.Public}
													checked={
														projectCodeStore.project?.visibility === VisibilityState.Public
													}
													onChange={() => {
														projectCodeStore.project!.visibility = VisibilityState.Public
													}}
												/>
												<label
													htmlFor="visibility-public"
													className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
												>
													Public
												</label>
											</div>
											<div className="mb-4 flex items-center">
												<Radio
													name="visibility"
													id="visibility-secret"
													value={VisibilityState.Secret}
													checked={
														projectCodeStore.project?.visibility === VisibilityState.Secret
													}
													onChange={() => {
														projectCodeStore.project!.visibility = VisibilityState.Secret
													}}
												/>
												<label
													htmlFor="visibility-secret"
													className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
												>
													Secret (accessible by URL)
												</label>
											</div>
											<div className="mb-4 flex items-center">
												<Radio
													name="visibility"
													id="visibility-private"
													value={VisibilityState.Private}
													checked={
														projectCodeStore.project?.visibility === VisibilityState.Private
													}
													onChange={() => {
														projectCodeStore.project!.visibility = VisibilityState.Private
													}}
												/>
												<label
													htmlFor="visibility-private"
													className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
												>
													Private (only invited users have access)
												</label>
											</div>
										</div>
										<button
											type="submit"
											className="rounded-md bg-sky-600 py-2 text-gray-300 disabled:bg-sky-800 disabled:text-gray-500"
										>
											Save
										</button>
									</form>
								</div>
							</Popover>
						)}
					</div>

					{/* <button
						className="flex h-full items-center justify-center gap-1 px-2.5 text-12 text-gray-300"
						onClick={openNewTab}
					>
						<VscMultipleWindows className="flex-shrink-0 text-lg" /> Open in New Tab
					</button> */}
					<button
						className="flex h-full items-center justify-center gap-1 px-2.5 text-12 text-gray-300"
						onClick={toggleBrowser}
					>
						{isOpenBrowser && (
							<>
								<VscLayoutSidebarRightOff className="flex-shrink-0 text-lg" /> Close
							</>
						)}
						{!isOpenBrowser && (
							<>
								<VscLayoutSidebarRight className="flex-shrink-0 text-lg" /> Open
							</>
						)}
					</button>
				</div>
			)
		}),
	),
)
