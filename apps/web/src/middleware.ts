import { NextResponse, type NextRequest } from 'next/server';
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

const isMockAuthBypass =
  process.env.NODE_ENV === 'development' &&
  (process.env.USE_MOCK_SERVICES === 'true' || process.env.NEXT_PUBLIC_USE_MOCK === 'true');

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('x-request-id', crypto.randomUUID());
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

function mockMiddleware(request: NextRequest) {
  return addSecurityHeaders(NextResponse.next());
}

// In local mock mode, skip Auth0 entirely for development convenience.
export default isMockAuthBypass
  ? mockMiddleware
  : withMiddlewareAuthRequired({
      returnTo: '/',
    });

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|api/health|api/guest|meeting-link|api/recordings/webhook).*)'],
};
