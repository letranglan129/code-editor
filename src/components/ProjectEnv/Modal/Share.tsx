import { Combobox } from '@headlessui/react'
import axios from 'axios'
import { debounce } from 'lodash'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { usePopper } from 'react-popper'
import { IUser } from '../../../modules/mongo/schema/User'
import { ProjectCodeStore } from '../../../store/projects'
import { VisibilityState } from '../../../utils/types'
import Card from '../../Card'
import Grid from '../../Grid'
import Radio from '../../Radio'
import SelectField, { optionsClassName, selectPopperOptions } from '../../SelectField'
import { observer } from 'mobx-react-lite'
import { VscTrash } from 'react-icons/vsc'

const permissions = [
	{ id: 'viewer', label: 'as viewer' },
	{ id: 'editor', label: 'as editor' },
	{ id: 'co-owner', label: 'as co-owner' },
]

export default observer(function Share({ projectCodeStore }: { projectCodeStore: ProjectCodeStore }) {
	const { data: session, status } = useSession()
	const [search, setSearch] = useState('')
	const [selectedPer, setSelectedPer] = useState('viewer')
	const [searchUsers, setSearchUsers] = useState<IUser[]>([])
	const [refButton, setRefButton] = useState<HTMLElement | null>(null)
	const [refOptions, setRefOptions] = useState<any>(null)
	const { styles, attributes } = usePopper(refButton, refOptions, selectPopperOptions)
	const [usersPermission, setUsersPermission] = useState([
		{
			image: session?.user.image,
			name: session?.user.name,
			per: 'co-owner',
		},
	])

	const getUserByEmail = useCallback(
		async (search: string) => {
			const { data } = await axios.get(`/api/user?email=${search}`)
			const listIdUsers = [
				...(projectCodeStore.project?.permissions?.map(p => String(p.uuid._id)) || []),
				session?.user.id,
			]
			const users = data.filter((u: any) => !listIdUsers.includes(u._id))
			setSearchUsers(users)
		},
		[projectCodeStore.project?.permissions],
	)

	useEffect(() => {
		if (search === '') {
			setSearchUsers([])
			return
		}
		getUserByEmail(search)
	}, [search])

	const cardOptionsStyle = {
		minWidth: `${refButton?.offsetWidth}px`,
		maxHeight: 200,
	}

	const inviteUser = async (userId: string) => {
		const { data } = await axios.post(`/api/projects/${projectCodeStore.project?.slug}/invite`, {
			userId,
			permission: selectedPer,
		})

		projectCodeStore.setPermissions(data.project.permissions)
	}

	const editPermissionUser = async (userId: string, permissionName: string, type: string) => {
		const { data } = await axios.patch(`/api/projects/${projectCodeStore.project?.slug}/invite`, {
			userId,
			permission: permissionName,
			type,
		})

		projectCodeStore.setPermissions(data.project.permissions)
	}

	const updateVisibility = async (visibility: string) => {
		await axios.patch(`/api/projects/${projectCodeStore.project?.slug}`, {
			visibility,
		})
	}

	return (
		<div>
			<div>
				<p>Visibility</p>
				<div className="mb-4 flex items-center">
					<Radio
						name="visibility"
						id="visibility-public"
						value={VisibilityState.Public}
						checked={projectCodeStore.project?.visibility === VisibilityState.Public}
						onChange={async () => {
							await updateVisibility(VisibilityState.Secret)
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
						checked={projectCodeStore.project?.visibility === VisibilityState.Secret}
						onChange={async () => {
							await updateVisibility(VisibilityState.Secret)
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
						checked={projectCodeStore.project?.visibility === VisibilityState.Private}
						onChange={async () => {
							await updateVisibility(VisibilityState.Private)
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
			<div>
				<p>Share with other users</p>
				<div className="flex items-center !bg-neutral-700">
					<div className="relative w-3/4">
						<Combobox>
							<Combobox.Input
								ref={setRefButton}
								onChange={debounce(
									(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
									500,
								)}
								placeholder="Add user..."
								className="ml-[1px] h-7 w-full flex-shrink-0 border border-transparent bg-zinc-800 px-3 text-12 outline-none focus:border-blue-500"
							/>
							<Combobox.Options
								className={optionsClassName + ' max-h-96'}
								ref={setRefOptions}
								style={styles.popper}
								{...attributes.popper}
							>
								<Card className="h-full" padding={false} style={cardOptionsStyle}>
									{searchUsers.map(user => (
										<Combobox.Option
											className="flex cursor-pointer items-center px-3 py-1 hover:bg-neutral-800"
											onClick={async () => await inviteUser(String(user._id))}
											key={user.fullName}
											value={user}
										>
											<Image
												className="rounded-full"
												src={user.image}
												width={24}
												height={24}
												alt=""
											/>
											<span className="pl-2 pr-4 text-13">{user.fullName}</span>
											<span className="text-11">{user.email}</span>
										</Combobox.Option>
									))}
								</Card>
							</Combobox.Options>
						</Combobox>
					</div>
					<div className="w-1/4">
						<SelectField
							size="s"
							value={selectedPer}
							options={permissions}
							onChange={setSelectedPer}
							handlerSelected={selected => (
								<Grid space="s" items="center">
									<span>{selected.label}</span>
								</Grid>
							)}
							border={false}
							className="!ml-[1px] !rounded-none !bg-neutral-700"
						/>
					</div>
				</div>
				<div className="">
					<div
						className="flex items-center justify-between py-1"
						key={projectCodeStore.project?.uuid.fullName}
					>
						<div className="flex cursor-pointer items-center px-3 py-1 hover:bg-neutral-800">
							<Image
								className="rounded-full"
								src={projectCodeStore.project?.uuid.image || ''}
								width={24}
								height={24}
								alt=""
							/>
							<span className="pl-2 pr-4 text-13">{projectCodeStore.project?.uuid.fullName}</span>
							<span className="text-13">{projectCodeStore.project?.uuid.fullName}</span>
						</div>
						<p className="w-36 text-13">as co-owner</p>
					</div>
					{projectCodeStore.project?.permissions?.map(({ uuid: user, permissionName }, index) => {
						return (
							<div className="flex items-center justify-between py-1" key={user.fullName}>
								<div className="flex cursor-pointer items-center px-3 py-1 hover:bg-neutral-800">
									<Image className="rounded-full" src={user.image} width={24} height={24} alt="" />
									<span className="pl-2 pr-4 text-13">{user.fullName}</span>
									<span className="text-13">{user.fullName}</span>
								</div>
								<div className="w-1/4">
									{session?.user.id === projectCodeStore.project?.uuid._id ? (
										<div className="flex">
											<SelectField
												size="s"
												value={permissionName}
												options={permissions}
												onChange={async value => {
													editPermissionUser(String(user._id), value, 'edit')
												}}
												handlerSelected={selected => (
													<Grid space="s" items="center">
														<span>{selected.label}</span>
													</Grid>
												)}
												border={false}
												className="!ml-[1px] !rounded-none !bg-neutral-700"
											/>
											<button
												onClick={async () => {
													editPermissionUser(String(user._id), permissionName, 'delete')
												}}
												className="px-4 hover:bg-neutral-800 hover:text-red-600"
											>
												<VscTrash />
											</button>
										</div>
									) : (
										<span>{permissionName}</span>
									)}
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
})
