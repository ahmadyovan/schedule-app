import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { get_single_data } from './functions'
import { resolveRedirectPath } from '@/utils/auth/redirect-by-role' // path sesuaikan

const PUBLIC_ROUTES = ['/sign-in', '/signup', '/forgot-password', '/reset-password', '/not-authorized', '/jadwal']
const AUTH_ROUTES = ['/sign-in', '/signup']

export async function updateSession(request: NextRequest) {
	const currentPath = request.nextUrl.pathname
	console.log(`[Middleware] Request to: ${currentPath}`)

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
				getAll: () => request.cookies.getAll(),
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

		const userData = await get_single_data<{ job: string }>("user", "job", [
			{ column: "uid", value: user.id }
		]);

		if (userData) {
			const role = userData.job;
			const redirectPath = await resolveRedirectPath(role);

			console.log(`[Middleware] User role: ${role}, Redirect path: ${redirectPath}`)

			if (!redirectPath) {
				const url = request.nextUrl.clone()
				url.pathname = '/not-authorized'
				return NextResponse.redirect(url)
			}

			// Cegah akses ke halaman auth kalau sudah login
			if (AUTH_ROUTES.includes(currentPath)) {
				const url = request.nextUrl.clone()
				url.pathname = redirectPath
				return NextResponse.redirect(url)
			}

			const allowedRoot = "/" + role;

			// Cek izin akses
			if ( !currentPath.startsWith(allowedRoot) && !PUBLIC_ROUTES.includes(currentPath)) {
				console.log(`[Middleware] Access denied to ${currentPath}`)
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
