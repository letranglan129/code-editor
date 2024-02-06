'use client'

import { createStore } from 'devextreme-aspnet-data-nojquery'
import { TextBox } from 'devextreme-react/text-box'
import DataSource from 'devextreme/data/data_source'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import List, { ListRef } from '../../../../../components/List'
import ProjectFullInfo from '../../../../../components/List/ProjectFullInfo'
import Scrollbar from '../../../../../components/Scrollbar'
import { IProject } from '../../../../../modules/mongo/schema/Project'

export default function ProfilePage() {
	const [totalCount, setTotalCount] = useState(0)
	const dataSource = useMemo(
		() =>
			new DataSource<IProject>({
				store: createStore({
					key: 'slug',
					loadUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/projects`,
				}),
				paginate: true,
				pageSize: 20,
				requireTotalCount: true,
			}),
		[],
	)

	useEffect(() => {
		dataSource.on('loadingChanged', (e: boolean) => {
			if (!e) {
				setTotalCount(dataSource.totalCount())
			}
		})
	}, [dataSource])

	return (
		<Scrollbar className="flex  h-[unset] flex-1">
			<div className="flex flex-1 flex-col p-2 sm:p-4 md:p-8">
				<div className="mx-auto w-full max-w-4xl">
					<div className="flex items-start ">
						<div className="mr-4">
							<Image src="/logo.svg" width={80} height={80} alt="" className="rounded-md" />
						</div>
						<div>
							<h6 className="mb-2 text-2xl font-semibold">letranglan129</h6>
							<p className="text-14">letranglan129</p>
						</div>
					</div>
					<div className="mb-4 mt-8 flex items-center justify-between">
						<div className="flex items-center">
							<span className="mr-2 text-13 font-semibold uppercase">Project</span>
							<div className="bg-gray-700 bg-opacity-60 p-1">
								<div className="flex h-6 w-6 items-center justify-center bg-neutral-900 bg-opacity-70 text-13 leading-none">
									{totalCount}
								</div>
							</div>
						</div>
						<div>
							<TextBox
								mode="search"
								placeholder="Filter projects"
								className=" w-56 !bg-transparent text-13"
								valueChangeEvent="keyup"
								onValueChanged={({ value }) => {
									dataSource.searchValue(value)
									dataSource.searchExpr(['title', 'description'])
									dataSource.load()
								}}
							/>
						</div>
					</div>
					<List
						className="project-profile-list"
						dataSource={dataSource}
						focusStateEnabled={false}
						activeStateEnabled={false}
						itemRender={ProjectFullInfo}
						showPager={true}
					/>
				</div>
			</div>
		</Scrollbar>
	)
}
