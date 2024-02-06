import { createStore } from 'devextreme-aspnet-data-nojquery'
import DataSource from 'devextreme/data/data_source'
import React, { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { IProject } from '../../modules/mongo/schema/Project'
import Pager from '../Pager'
import DevList, { IListOptions } from 'devextreme-react/list'

interface ListProps<T> extends IListOptions {
	showPager?: boolean
	dataSource: DataSource<T>
	itemRender: (item: T) => React.ReactNode
	pageIndex?: number
	pageSize?: number
}

export interface ListRef {
	load: () => void
	pageIndex: number
	pageSize: number
	totalCount: number
	setPageIndex: (pageIndex: number) => void
	setPageSize: (pageSize: number) => void
}

export default memo(
	forwardRef(function List(
		{ showPager = true, dataSource, itemRender, pageIndex = 1, pageSize = 20, ...props }: ListProps<IProject>,
		ref: React.Ref<ListRef>,
	) {
		const [_pageIndex, setPageIndex] = useState(pageIndex)
		const [_pageSize, setPageSize] = useState(pageSize)
		const [_totalCount, setTotalCount] = useState(0)

		useEffect(() => {
			dataSource.on('loadingChanged', (e: boolean) => {
				if (!e) {
					setPageIndex(dataSource.pageIndex())
					setPageSize(dataSource.pageSize())
					setTotalCount(dataSource.totalCount())
				}
			})

			return () => {
				dataSource.off('loadingChanged')
			}
		}, [dataSource])

		useImperativeHandle(
			ref,
			() => ({
				load: () => {
					dataSource.load()
				},
				pageIndex: _pageIndex,
				pageSize: _pageSize,
				totalCount: _totalCount,
				setPageIndex: (pageIndex: number) => {
					dataSource.pageIndex(pageIndex)
				},
				setPageSize: (pageSize: number) => {
					dataSource.pageSize(pageSize)
				},
			}),
			[dataSource, _pageIndex, _pageSize, _totalCount],
		)

		return (
			<>
				<DevList
					dataSource={dataSource}
					focusStateEnabled={false}
					activeStateEnabled={false}
					itemRender={itemRender}
					{...props}
				/>
				{showPager && dataSource.isLoaded() === true && (
					<div className="sticky bottom-0 bg-[#202327] py-2">
						<Pager
							pageIndex={_pageIndex}
							pageSize={_pageSize}
							totalCount={_totalCount}
							onPageChange={pageIndex => {
								dataSource.pageIndex(pageIndex)
								dataSource.load()
							}}
						/>
					</div>
				)}
			</>
		)
	}),
)
