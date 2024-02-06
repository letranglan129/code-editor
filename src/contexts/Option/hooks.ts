'use client'

import { useContext } from 'react'
import { OptionContext } from './Context'

export const useOption = () => {
	return useContext(OptionContext)
}
