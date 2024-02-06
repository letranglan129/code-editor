import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { connectToDb } from './modules/mongo'

export function middleware(request: NextRequest) {
	// connectToDb()
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: '/api/:path*',
}
