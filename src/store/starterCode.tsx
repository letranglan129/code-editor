import axios from 'axios'
import { makeAutoObservable } from 'mobx'
import { getStore, Store, useStore } from '.'
import { ProjectDataType } from '../utils/types'

export class ProjectStarterStore {
	store: Store
	projectStarters: ProjectDataType[] = []

	constructor(store: Store) {
		this.store = store
		makeAutoObservable(this, {}, { autoBind: true })
		if (this.projectStarters.length == 0) {
			axios.get<ProjectDataType[]>('/api/admin/projects/starter').then(res => {
				this.projectStarters = res.data
			}).catch(err => {})
		}
	}
}

export const useProjectStarterStore = () => {
	return useStore().projectStarterStore
}

export const getProjectStarterStore = () => {
	return getStore().projectStarterStore
}
