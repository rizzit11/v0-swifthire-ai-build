import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Routes that anyone (signed-in or not) may visit.
 * The landing page, marketing, auth routes, public share routes,
 * and static assets are whitelisted.
 */
const PUBLIC_PREFIXES = [
  "/auth",
  "/sign-in",
  "/sign-up",
  "/jobs",
  "/resume",
  "/_next",
  "/favicon.ico",
  "/api/health",
]

/** Paths that require auth AND an onboarded profile. */
function isGatedApp(pathname: string) {
  return (
    pathname.startsWith("/candidate") ||
    pathname.startsWith("/hr") ||
    pathname === "/dashboard"
  )
}

function isPublic(pathname: string) {
  if (pathname === "/") return true
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh the session every request so long-lived sessions don't expire
  // mid-navigation. This is the canonical Supabase SSR pattern.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Already-authed users visiting /sign-in or /sign-up go to /dashboard.
  if (
    user &&
    (pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/sign-up"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  if (!user && isGatedApp(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // Post-signup onboarding gate: user exists but has never chosen a role.
  // We run the check only on gated routes to avoid hammering the DB on
  // marketing pages.
  if (user && isGatedApp(pathname) && pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded, role")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile || profile.onboarded === false || !profile.role) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  // Generic fallthrough for any other non-public route
  if (!user && !isPublic(pathname) && pathname !== "/onboarding") {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return response
}
