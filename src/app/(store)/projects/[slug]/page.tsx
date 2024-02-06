'use client'

import dynamic from 'next/dynamic'
import 'devextreme/dist/css/dx.dark.css'
import '@/app/codeEditor.css'
const App = dynamic(() => import('@/components/App/Code'), { ssr: false })

export default function Page({ params }: { params: { slug: string } }) {
	return <App projectId={params.slug} />
}
