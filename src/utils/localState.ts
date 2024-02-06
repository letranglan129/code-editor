"use client"

const USER_LOCAL_STATE_KEY = 'userLocalState'

export interface UserLocalState {
	theme: 'dark' | 'light' | 'auto'
	lastProjectId: string
}

export const getDefaultUserLocalState = (): UserLocalState => {
	return {
		theme: 'dark',
		lastProjectId: '',
	}
}

export const getLocalState = (): UserLocalState => {
	let data

	try {
		const localItem = typeof window !== 'undefined' && localStorage.getItem(USER_LOCAL_STATE_KEY)
		if (localItem) {
			data = JSON.parse(localItem)
		}
	} catch (err) {
		console.error(err)
	}

	return data || getDefaultUserLocalState()
}

export const updateLocalState = (data: Partial<UserLocalState>) => {
	const currentState = getLocalState()
	const newState = { ...currentState, ...data }

	try {
		typeof window !== 'undefined' && localStorage.setItem(USER_LOCAL_STATE_KEY, JSON.stringify(newState))
	} catch (err) {
		console.error(err)
	}

	return newState
}
