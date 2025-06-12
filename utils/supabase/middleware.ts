// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/sign-in', '/signup', '/forgot-password', '/reset-password', '/not-authorized']
const AUTH_ROUTES = ['/sign-in', '/signup']

const ROLE_ACCESS: Record<string, string> = {
  kaprodi: '/kaprodi',
  dosen: '/dosen',
  admin: '/admin',
}

export async function updateSession(request: NextRequest) {
	const currentPath = request.nextUrl.pathname
	console.log(`[Middleware] Request to: ${currentPath}`)

	// Skip middleware untuk API routes
	if (currentPath.startsWith('/api')) {
		console.log('[Middleware] Skipping API route...')
		return NextResponse.next()
	}

	let supabaseResponse = NextResponse.next({ request })

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll()
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
					supabaseResponse = NextResponse.next({ request })
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					)
				},
			},
		}
	)

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (user) {
		console.log(`[Middleware] User is logged in: ${user.id}`)

		const { data } = await supabase
			.from('user')
			.select('job')
			.eq('uid', user.id)
			.single()

		if (data) {
			const role = data.job
			const allowedRoutes = ROLE_ACCESS[role]
			console.log(`[Middleware] User role: ${role}, Allowed route: ${allowedRoutes}`)

			// Redirect user dari halaman auth jika sudah login
			if (AUTH_ROUTES.includes(currentPath)) {
				console.log('[Middleware] Redirecting logged-in user away from auth page...')
				const url = request.nextUrl.clone()
				url.pathname = allowedRoutes
				return NextResponse.redirect(url)
			}

			// Cek apakah current path diizinkan untuk role tersebut
			if (!currentPath.startsWith(allowedRoutes) && !PUBLIC_ROUTES.includes(currentPath)) {
				console.log(`[Middleware] User trying to access unauthorized path: ${currentPath}`)
				const url = request.nextUrl.clone()
				url.pathname = '/not-authorized'
				return NextResponse.redirect(url)
			}
		} else {
			console.log('[Middleware] Role data not found for user')
		}
	} else {
		console.log('[Middleware] No user logged in')
	}

	// Security headers
	const securityHeaders = {
		'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	}

	Object.entries(securityHeaders).forEach(([key, value]) => {
		supabaseResponse.headers.set(key, value)
	})

	console.log('[Middleware] Middleware completed')
	return supabaseResponse
}
