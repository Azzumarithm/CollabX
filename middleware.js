import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes (authentication required)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/workspace(.*)',
]);

export default clerkMiddleware((auth, req) => {

  if (isProtectedRoute(req)) {
    // Enable authentication for protected routes
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};