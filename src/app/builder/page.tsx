'use client'

import dynamic from 'next/dynamic'
import React from 'react'
const App = dynamic(() => import('@/components/App/Builder'), { ssr: false })

export default function Page() {
	return <App options={{}} />
}
