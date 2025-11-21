import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Allow all API routes to pass through (they handle their own authentication)
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Define public routes that should be accessible without authentication
    const publicRoutes = [
      "/", 
      "/login", 
      "/register", 
      "/api/auth", 
      "/student/login", 
      "/student/registration",
      "/teacher/login",
      "/teacher/registration",
      "/admin/login",
      "/email-sent",
      "/verify-email"
    ];
    
    // If it's a public route (especially the root), allow access immediately
    // Check exact match first, then check if pathname starts with the route
    const isPublicRoute = pathname === "/" || 
      publicRoutes.some((route) => {
        if (pathname === route) return true;
        if (pathname.startsWith(route + "/")) return true;
        return false;
      });
    
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // If no token and trying to access protected route, redirect to home
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const userRole = token.role;

    // Protect admin routes - only admins can access
    if (pathname.startsWith("/admin")) {
      if (userRole !== "admin") {
        // Redirect based on user role
        if (userRole === "student") {
          return NextResponse.redirect(new URL("/student/dashboard", req.url));
        } else if (userRole === "teacher") {
          return NextResponse.redirect(new URL("/teacher/dashboard", req.url));
        }
        // If no role or unknown role, redirect to home
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Protect teacher routes - only teachers can access
    if (pathname.startsWith("/teacher")) {
      if (userRole !== "teacher") {
        // Redirect based on user role
        if (userRole === "student") {
          return NextResponse.redirect(new URL("/student/dashboard", req.url));
        } else if (userRole === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        // If no role or unknown role, redirect to home
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Protect student routes - only students can access
    if (pathname.startsWith("/student")) {
      if (userRole !== "student") {
        // Redirect based on user role
        if (userRole === "teacher") {
          return NextResponse.redirect(new URL("/teacher/dashboard", req.url));
        } else if (userRole === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        // If no role or unknown role, redirect to home
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only require authentication for protected routes
        const pathname = req.nextUrl.pathname;
        
        // Allow all API routes to pass through (they handle their own authentication)
        if (pathname.startsWith("/api/")) {
          return true;
        }
        
        // Public routes that don't require authentication
        const publicRoutes = [
          "/", 
          "/login", 
          "/register", 
          "/api/auth", 
          "/student/login", 
          "/student/registration",
          "/teacher/login",
          "/teacher/registration",
          "/admin/login",
          "/email-sent",
          "/verify-email"
        ];
        
        // If it's a public route, allow access
        // Check exact match first, then check if pathname starts with the route
        const isPublicRoute = pathname === "/" || 
          publicRoutes.some((route) => {
            if (pathname === route) return true;
            if (pathname.startsWith(route + "/")) return true;
            return false;
          });
        
        if (isPublicRoute) {
          return true;
        }

        // For protected routes, require a token
        if (pathname.startsWith("/admin") || 
            pathname.startsWith("/teacher") || 
            pathname.startsWith("/student")) {
          return !!token;
        }

        // Allow other routes
        return true;
      },
    },
  }
);

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * Note: Root path (/) is handled in the middleware function itself
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

