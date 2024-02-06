'use client'

import { useEffect, useState } from 'react'

import { IOption } from '../../modules/mongo/schema/Option'
import { OptionContext } from './Context'
import axios from 'axios'

export const OptionProvider = ({ children }: { children: React.ReactNode }) => {
	const [options, setOptions] = useState<IOption>({
		types: [],
		cores: [],
		icons: [],
	})

	const getOptions = async () => {
		const { data } = await axios.get('/api/options')
		localStorage.setItem('options', JSON.stringify(data))
		setOptions(data)
	}

	useEffect(() => {
		const localOptionJson = localStorage.getItem('options')
		if (localOptionJson) {
			const localOptions = JSON.parse(localOptionJson) as IOption

			if (
				!localOptions?.types ||
				!localOptions?.cores ||
				!localOptions?.icons ||
				localOptions.types.length === 0 ||
				localOptions.cores.length === 0 ||
				localOptions.icons.length === 0
			) {
				getOptions()
			}
			setOptions(localOptions)
		} else {
			getOptions()
		}
	}, [])

	return <OptionContext.Provider value={{ ...options }}>{children}</OptionContext.Provider>
}
