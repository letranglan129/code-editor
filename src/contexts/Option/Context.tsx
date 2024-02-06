'use client'
import { createContext } from 'react'
import { IOption } from '../../modules/mongo/schema/Option'

export const OptionContext = createContext<IOption>({
	types: [],
	cores: [],
	icons: [],
})
