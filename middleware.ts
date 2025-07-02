import { authMiddleware } from "@clerk/nextjs";

// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhook",
    // Add other public routes as needed
    "/api/(.*)" // Making API routes public for now, adjust based on your needs
  ],
  ignoredRoutes: [
    "/((?!api|trpc))(_next|.+\\.[\\w]+$)", // Ignore static files
    "/api/webhook" // Ignore webhook
  ]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
 