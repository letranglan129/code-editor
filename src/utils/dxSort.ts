import { DxDataGridSorting } from './types'

export const convertSortQuery = (sort: DxDataGridSorting[]) => {
	const sortQuery: any = {}
	sort.forEach(item => {
		sortQuery[item.selector] = item.desc ? -1 : 1
	})
	return sortQuery
}