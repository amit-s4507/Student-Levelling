import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

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
    "/icons/(.*)"
  ],
  async afterAuth(auth, req) {
    // Allow public routes and static files
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect to sign-in if not authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Handle user initialization only for authenticated users
    if (auth.userId && !auth.isPublicRoute) {
      try {
        const response = await fetch(`${req.nextUrl.origin}/api/user/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.getToken()}`,
          },
        });

        if (!response.ok) {
          console.error('Error initializing user:', await response.text());
        }
      } catch (error) {
        console.error('Error calling user init:', error);
      }
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};
 