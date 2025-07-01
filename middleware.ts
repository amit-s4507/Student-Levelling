import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhook",
    "/Home"
  ],
  ignoredRoutes: [
    "/((?!api|trpc))(_next|.+\\.[\\w]+$)", // Ignore static files
    "/favicon.ico",
    "/api/chat", // Allow public access to chat API
    "/api/imagen", // Allow public access to imagen API
  ]
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
};
 