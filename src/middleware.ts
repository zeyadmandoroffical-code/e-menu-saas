import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Define allowed root domains (update with your actual production domain)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'yourdomain.com'

  // Extract custom domain or subdomain
  let currentHost = hostname
    .replace(`.${rootDomain}`, '')
    .replace('.localhost:3000', '')
    .replace(':3000', '')

  // Ignore main domains & www
  if (
    currentHost === rootDomain ||
    currentHost === 'www' ||
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1' ||
    currentHost === ''
  ) {
    return NextResponse.next()
  }

  // If path already starts with /menu, prevent double rewrite loop
  if (url.pathname.startsWith('/menu')) {
    return NextResponse.next()
  }

  // Rewrite subdomain requests internally (e.g. burger.domain.com/item -> /menu/burger/item)
  url.pathname = `/menu/${currentHost}${url.pathname}`
  return NextResponse.rewrite(url)
}
