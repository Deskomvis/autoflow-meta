import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = 'afm_aff';
const CODE_RE = /^[A-Z0-9]{4,16}$/;

export function proxy(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('aff');
  if (!raw) return NextResponse.next();

  const code = raw.trim().toUpperCase();
  if (!CODE_RE.test(code)) return NextResponse.next();

  const response = NextResponse.next();
  const days = Number(process.env.AFFILIATE_COOKIE_DAYS) || 30;
  response.cookies.set(COOKIE_NAME, code, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: days * 24 * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
