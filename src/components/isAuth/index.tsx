'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function isAuth(Component: any) {
	return function IsAuth(props: any) {
        const { data: session } = useSession({
            required: true,
            onUnauthenticated() {
                redirect("/login")
            }
        })

		return <Component {...props} />
	}
}
