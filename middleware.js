import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes (no authentication needed)
const isPublicRoute = createRouteMatcher([
  '/api/webhooks(.*)', // Webhook routes should be public
]);

// Define protected routes (authentication required)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/workspace(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    // Disable authentication for public routes
    auth().protect(false);
  } else if (isProtectedRoute(req)) {
    // Enable authentication for protected routes
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};