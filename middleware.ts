import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  afterAuth(auth, req) {
    // Handle user initialization only for authenticated users
    if (auth.userId && !auth.isPublicRoute) {
      // Get the session token from the auth object
      const sessionToken = auth.sessionClaims?.sub;

      // Call the user initialization endpoint
      fetch(`${req.nextUrl.origin}/api/user/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass the session token in a custom header
          'x-session-token': sessionToken || '',
        },
      }).catch(error => {
        console.error('Error initializing user:', error);
      });
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
 