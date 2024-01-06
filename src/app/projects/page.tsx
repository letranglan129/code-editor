'use client'

import dynamic from 'next/dynamic'
const App = dynamic(() => import('@/components/App/Code'), { ssr: false })

export default function Page() {
	return <App />
}
