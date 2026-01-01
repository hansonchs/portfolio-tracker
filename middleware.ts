import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes - don't require authentication
const isPublicRoute = createRouteMatcher([
  '/landing', // Landing page is public
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware((auth, request) => {
  // For public routes, don't check auth
  if (isPublicRoute(request)) {
    return;
  }
  // For protected routes, redirect unauthenticated users to landing
  auth.protect();
});

export const config = {
  // Match all routes except for static files
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
