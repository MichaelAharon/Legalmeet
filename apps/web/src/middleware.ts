import { NextResponse, type NextRequest } from 'next/server';
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { shouldUseMockServices } from '@/lib/mock-mode';

const shouldBypassAuthForMock = shouldUseMockServices();

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

// Local mock development can skip Auth0, but production must always require Auth0.
export default shouldBypassAuthForMock
  ? mockMiddleware
  : withMiddlewareAuthRequired({
      returnTo: '/',
    });

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|api/health|api/guest|meeting-link|api/recordings/webhook).*)'],
};
