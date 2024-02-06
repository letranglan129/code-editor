'use client'

import ManagerLeftSidebar from '@/components/ManagerLeftSidebar'
import Scrollbar from '@/components/Scrollbar'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { FaPlus } from 'react-icons/fa6'

import '@/app/home.css'
import ProjectStarter from '@/components/ProjectStarter'
import { useModalStore } from '@/store/modalStore'
import { createStore } from 'devextreme-aspnet-data-nojquery'
import TextBox from 'devextreme-react/text-box'
import DataSource from 'devextreme/data/data_source'
import 'devextreme/dist/css/dx.dark.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { IoClose, IoMenu } from 'react-icons/io5'
import List from '../../../components/List'
import ProjectSearchInfo from '../../../components/List/ProjectSearchInfo'
import PopoverUser from '../../../components/Popover/PopoverUser'
import Create from '../../../components/ProjectStarter/Create'
import lang from '../../../locale/en'
import { IProject } from '../../../modules/mongo/schema/Project'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
	const { data: session, status, update } = useSession()
	const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(false)
	const [query, setQuery] = useState<string>('')

	const router = useRouter()

	if (status === 'unauthenticated') {
		router.push('/')
	}

	const modelStore = useModalStore()

	const dataSource = useMemo(
		() =>
			new DataSource<IProject>({
				store: createStore({
					key: 'slug',
					loadUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/projects`,
				}),
				paginate: false,
				pageSize: 10,
			}),
		[],
	)

	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<section className="mx-auto flex h-10 w-full flex-shrink-0 items-center justify-between bg-grayNetural px-3  py-1">
				<div className="flex w-full items-center">
					<button className="mr-2 p-1 lg:hidden" onClick={() => setIsOpenSidebar(true)}>
						<IoMenu className="text-xl" />
					</button>
					<Link className="flex-shrink-0" href={'/'}>
						<Image className="rounded-md" src="/logo.svg" alt="" width={28} height={28} />
					</Link>
					<div className="relative mx-4">
						<TextBox
							mode="search"
							placeholder="Title or description"
							className=" max-h-8 w-64 !bg-transparent text-13"
							valueChangeEvent="keyup"
							onValueChanged={({ value }) => {
								setQuery(value)
								dataSource.searchValue(value)
								dataSource.searchExpr(['title', 'description'])
								dataSource.load()
							}}
						/>
						{query.trim() !== '' && (
							<div className="absolute z-10 max-h-[min(calc(100vh-40px),_400px)] w-full bg-[#202327] shadow-lg">
								<div className="relative flex max-h-[min(calc(100vh-40px),_360px)] flex-col">
									<Scrollbar className="flex  h-[unset] flex-1">
										<List
											className=""
											dataSource={dataSource}
											focusStateEnabled={false}
											activeStateEnabled={false}
											itemRender={ProjectSearchInfo}
											showPager={false}
											scrollByContent={true}
										/>
									</Scrollbar>
								</div>
								<div className="block border-t border-neutral-700 bg-[#202327] p-2 pt-3 text-right text-xs text-gray-400">
									hit enter to display all results ⏎
								</div>
							</div>
						)}
					</div>
					<div className="ml-auto flex items-center justify-center">
						{status === 'authenticated' && session.user.rule === 'admin' && (
							<button
								className="mx-1 ml-auto flex items-center justify-center rounded-[4px] border border-transparent px-3 py-1 text-13 text-cyan-400 hover:border-neutral-700  hover:bg-neutral-900 hover:bg-opacity-60"
								onClick={() =>
									modelStore.open({
										content: <Create />,
										title: lang.createProject,
									})
								}
							>
								<FaPlus className="mr-2" />{' '}
								<span className="hidden md:inline-block">{lang.createProject}</span>
							</button>
						)}
						<button
							className="mx-1 flex items-center justify-center rounded-[4px] border border-transparent px-3 py-1 text-13 text-cyan-400 hover:border-neutral-700  hover:bg-neutral-900 hover:bg-opacity-60"
							onClick={() =>
								modelStore.open({
									content: <ProjectStarter />,
									title: lang.newProject,
								})
							}
						>
							<FaPlus className="mr-2" />{' '}
							<span className="hidden md:inline-block">{lang.newProject}</span>
						</button>
						<div className="ml-1 flex-shrink-0">
							{status === 'authenticated' && <>{session.user?.image && <PopoverUser />}</>}
						</div>
					</div>
				</div>
			</section>
			<div className="flex flex-1 overflow-hidden">
				<section
					className={`${
						isOpenSidebar ? 'fixed top-0 z-50 inline-block h-full' : 'hidden'
					} w-60 flex-shrink-0 bg-grayNetural lg:inline-block `}
				>
					{isOpenSidebar && (
						<div className="flex h-10 items-center px-3 py-1">
							<button
								className="mr-2 p-1"
								onClick={() => {
									setIsOpenSidebar(false)
								}}
							>
								<IoClose className="text-xl" />
							</button>
						</div>
					)}
					<ManagerLeftSidebar />
				</section>

				{isOpenSidebar && (
					<div
						onClick={() => setIsOpenSidebar(false)}
						className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50"
					></div>
				)}
				<div className="flex flex-1 overflow-hidden bg-[#202327]">
					{/* <Scrollbar className="flex  h-[unset] flex-1"> */}
					<section className="flex w-full flex-1 overflow-hidden">{children}</section>
					{/* </Scrollbar> */}
				</div>
			</div>
		</div>
	)
}
