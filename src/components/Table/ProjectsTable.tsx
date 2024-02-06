'use client'

import { createStore } from 'devextreme-aspnet-data-nojquery'
import DataGrid, { Column, Editing, Paging, Button } from 'devextreme-react/data-grid'
import { Popup, ToolbarItem } from 'devextreme-react/popup'
import { Properties } from 'devextreme/ui/data_grid'
import { Ref, forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { DxCustomStoreOptions } from '../../utils/types'

import { useRouter } from 'next/navigation'
import { FaRegTrashCan } from 'react-icons/fa6'
import { getIcon } from '../../utils/icon'
import { useSession } from 'next-auth/react'

export type ProjectTableType = {
	description: string
	forks_count: number
	title: string
	views_count: number
	level: number
	slug: string
	core: string
	updatedAt: string
}

export type ProjectsTableRef = {
	search: (value: string) => void
}

export type ProjectsTableProps = Properties & { store: DxCustomStoreOptions }

const Component = memo(
	forwardRef<ProjectsTableRef, ProjectsTableProps>(function ProjectsTable({ store, ...props }, ref) {
		const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
		const [isDelete, setIsDelete] = useState<boolean>(false)
		const { data: session, status } = useSession()
		const dataGridRef = useRef<DataGrid | null>(null)

		const dataSource = useMemo(
			() =>
				createStore({
					...store,
				}),
			[],
		)

		const openDeletePopup = useCallback(() => {
			setIsDelete(true)
		}, [])

		const closeDeletePopup = useCallback(() => {
			setIsDelete(false)
		}, [])

		const deleteProjects = useCallback(() => {
			const removeProcess = selectedRowKeys.map(key => {
				return dataSource.remove(key)
			})

			Promise.all(removeProcess).then(() => {
				dataGridRef.current?.instance.refresh()
				setSelectedRowKeys([])
			})

			closeDeletePopup()
		}, [selectedRowKeys])

		const onSelectedRowKeysChange = useCallback((selectedRowKeys: string[]) => {
			setSelectedRowKeys(selectedRowKeys)
		}, [])

		useImperativeHandle(
			ref,
			() => ({
				search: (value: string) => {
					dataGridRef.current?.instance.searchByText(value)
				},
			}),
			[dataGridRef],
		)

		return (
			<div className="flex flex-1 overflow-hidden">
				<Popup
					visible={isDelete}
					dragEnabled={false}
					hideOnOutsideClick={true}
					showCloseButton={false}
					showTitle={false}
					width="auto"
					height="auto"
					onHiding={() => setIsDelete(false)}
				>
					Are you sure you want to delete this record?
					<ToolbarItem
						widget="dxButton"
						toolbar="bottom"
						location="center"
						options={{
							stylingMode: 'contained',
							text: 'Yes',
							type: 'normal',
							onClick: deleteProjects,
						}}
					/>
					<ToolbarItem
						widget="dxButton"
						toolbar="bottom"
						location="center"
						options={{
							text: 'No',
							stylingMode: 'outlined',
							type: 'normal',
							onClick: closeDeletePopup,
						}}
					/>
				</Popup>
				<DataGrid
					id="gridContainer"
					className="no-bg h-full overflow-hidden pb-5"
					ref={dataGridRef}
					dataSource={dataSource}
					allowColumnReordering={true}
					showBorders={true}
					hoverStateEnabled={true}
					onSelectedRowKeysChange={onSelectedRowKeysChange}
					showRowLines={true}
					showColumnLines={false}
					remoteOperations={true}
					{...props}
				>
					<Paging enabled={true} />
					<Editing mode="row" allowUpdating={false} allowDeleting={true} allowAdding={false} />
					<Column
						dataField="title"
						caption="Title"
						width={192}
						minWidth={120}
						cellRender={cellData => {
							return (
								<a href={`/projects/${cellData.data.slug}`} className="flex hover:underline">
									<span>{getIcon(cellData.data.icon, 'w-4 h-4')}</span>
									{cellData.value}
								</a>
							)
						}}
					/>
					<Column dataField="description" caption="Description" minWidth={120} />
					<Column dataField="views_count" allowSearch={false} caption="Views" width={80} />
					<Column dataField="forks_count" allowSearch={false} caption="Forks" width={80} />
					<Column
						dataField="fullName"
						allowSearch={false}
						caption="Owner"
						width={150}
						cellRender={({ data }) => {
							return data.uuid === session?.user.id ? 'You' : data.fullName
						}}
					/>
					<Column
						dataField="updatedAt"
						caption="Updated"
						dataType="datetime"
						format="dd/MM/yyyy HH:MM"
						width={192}
						allowSearch={false}
					/>
					<Column type="buttons">
						<Button
							name="delete"
							visible={({ row }: any) => {
								return row.data.uuid === session?.user.id ? true : false
							}}
						/>
					</Column>
				</DataGrid>
				{selectedRowKeys.length > 0 && (
					<div className="fixed bottom-4 left-1/2 z-50 mt-auto flex -translate-x-1/2 gap-4 rounded-md border border-gray-600 bg-editor px-4 py-2 text-13 md:translate-x-0 lg:p-4">
						<span className="text-nowrap text-gray-500">{selectedRowKeys.length} Selected</span>
						<button
							className="flex items-center justify-center text-nowrap text-13 text-red-400"
							onClick={openDeletePopup}
						>
							<FaRegTrashCan className="mr-2 " />
							Delete projects
						</button>
					</div>
				)}
			</div>
		)
	}),
)

export default function ProjectsTable({
	tableRef,
	...props
}: ProjectsTableProps & { tableRef?: Ref<ProjectsTableRef> }) {
	return <Component ref={tableRef} {...props} />
}
