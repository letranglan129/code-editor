'use client'

import dynamic from 'next/dynamic'
import lang from '../../../../locale/en'
import Button from '../../../../components/Button'
import { FaPlus } from 'react-icons/fa6'
import TextBox from 'devextreme-react/text-box'
import { useEffect, useRef } from 'react'
import { ProjectsTableRef } from '../../../../components/Table/ProjectsTable'

const ProjectsTable = dynamic(() => import('../../../../components/Table/ProjectsTable'), { ssr: false })

export default function Projects() {
	const tableRef = useRef<ProjectsTableRef>(null)

	useEffect(() => {
		document.title = 'Projects - Code Builder'
	}, [])

	return (
		<div className="flex flex-col overflow-hidden p-2 sm:p-4 md:p-8">
			<div className="flex items-center justify-between">
				<h2>{lang.myProjects}</h2>
				<div className="flex items-center gap-3">
					<Button className="text-13 text-gray-400 flex items-center py-1.5 px-3 hover:bg-neutral-600 hover:bg-opacity-30">
						<FaPlus className="mr-2" /> {lang.new}
					</Button>
					<TextBox
						mode="search"
						placeholder="Title or description"
						className=" w-56 !bg-transparent text-13 max-h-8"
						valueChangeEvent="keyup"
						onValueChanged={({ value }) => {
							tableRef.current?.search(value)
						}}
					/>
				</div>
			</div>
			<ProjectsTable
				tableRef={tableRef}
				store={{
					key: 'slug',
					loadUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/projects`,
					deleteUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/projects`,
					onBeforeSend: (method, ajaxOptions) => {
						ajaxOptions.xhrFields = { withCredentials: true }
					},
				}}
				paging={{
					enabled: true,
					pageSize: 20,
				}}
				selection={{
					allowSelectAll: true,
					showCheckBoxesMode: 'always',
					mode: 'multiple',
					selectAllMode: 'page',
				}}
				editing={{
					confirmDelete: true,
					allowDeleting: true,
				}}
				wordWrapEnabled={true}
				width={'100%'}
			/>
		</div>
	)
}
