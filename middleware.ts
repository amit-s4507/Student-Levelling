import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhook(.*)",
    "/_next/static/(.*)",
    "/favicon.ico",
    "/icons/(.*)",
    "/images/(.*)",
    "/fonts/(.*)",
    "/manifest.json",
    "/robots.txt"
  ],
  ignoredRoutes: [
    "/api/webhook(.*)"
  ],
  afterAuth(auth, req) {
    // Handle auth state
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 