import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // TODO: validate access token, redirect unauthenticated to /login
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|unauthorized|$).*)'],
};
