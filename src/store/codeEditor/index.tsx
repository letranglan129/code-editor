'use client'

import React, { createContext, useContext } from 'react'
import { LocalSettingsStore, subscribeToLocalSettingsStore } from './localSettings'
import { ProjectCodeStore } from './projects'

let store: Store

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B

type WritableKeysOf<T> = {
	[P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
}[keyof T]

export type WritablePart<T> = Pick<T, WritableKeysOf<T>>

export type InitialStoreState<T> = {
	[P in keyof T]?: Partial<T[P]>
	// [P in keyof T]?: Partial<WritablePart<T[P]>>;
}
// export type InitialStoreState<T> = WritablePart<T>;

export type StoreProviderProps = {
	children: React.ReactNode
	initialState?: InitialStoreState<Store>
}

const StoreContext = createContext<Store | undefined>(undefined)

export class Store {
	localSettingsStore: LocalSettingsStore
	projects: ProjectCodeStore
		

	constructor(initialState?: InitialStoreState<Store>) {
		this.localSettingsStore = new LocalSettingsStore(this, initialState?.localSettingsStore)
		this.projects = new ProjectCodeStore(this, initialState?.projects)
	}
}

const subscribeToStore = (store: Store) => {
	subscribeToLocalSettingsStore(store.localSettingsStore)
}

export const StoreProvider = ({ children, initialState }: StoreProviderProps) => {
	if (!store) {
		store = new Store(initialState)
		subscribeToStore(store)
	}

	return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export const useStore = (): Store => {
	const context = useContext(StoreContext)
	if (!context) throw new Error('useStore must be used inside of StoreProvider')

	return context
}

export const getStore = (): Store => {
	if (!store) throw new Error('Store has not been initialized')

	return store
}

// @ts-ignore
if (typeof window !== 'undefined') window.getStore = getStore
