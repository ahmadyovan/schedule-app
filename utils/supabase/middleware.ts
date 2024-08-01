import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
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

  if (!user) {
    if (
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/auth')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } else {
    // Fetch user role from the database
    const { data: userData, error } = await supabase
      .from('user')
      .select('user_job')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user data:', error)
      // Handle error, perhaps redirect to an error page
      return supabaseResponse
    }

    const userJob = userData?.user_job
    

    // Define allowed paths for each role
    const allowedPaths = {
      dosen: ['/dosen'],
      kaprodi: ['/kaprodi'],
      admin: ['/admin'],
      // Add more roles and their allowed paths as needed
    }

    const currentPath = request.nextUrl.pathname

    // Check if the user is trying to access an allowed path
    if (userJob && allowedPaths[userJob as keyof typeof allowedPaths]) {
      const userAllowedPaths = allowedPaths[userJob as keyof typeof allowedPaths]
      if (!userAllowedPaths.some(path => currentPath.startsWith(path))) {
        // Redirect to the first allowed path for the user's role
        const url = request.nextUrl.clone()
        url.pathname = userAllowedPaths[0]
        return NextResponse.redirect(url)
      }
    } else {
      // If user role is not recognized or not set, you might want to redirect to a default page
      const url = request.nextUrl.clone()
      url.pathname = '/login' // or any other appropriate page
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}