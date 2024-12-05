import { NextResponse } from "next/server";

import { NextRequest } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname.startsWith("/"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*", "/verify/:path*"],
};

//////////// Corrected code (Another version)

// import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(request: NextRequest) {
//   const token = await getToken({ req: request }); // Check if the user is authenticated
//   const url = request.nextUrl;

//   const isAuthPage =
//     url.pathname.startsWith("/sign-in") ||
//     url.pathname.startsWith("/sign-up") ||
//     url.pathname.startsWith("/verify");

//   const isDashboardPage = url.pathname.startsWith("/dashboard");

//   // 1. If authenticated and trying to access auth pages, redirect to dashboard
//   if (token && isAuthPage) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   // 2. If not authenticated and trying to access protected pages, redirect to home or login
//   if (!token && isDashboardPage) {
//     return NextResponse.redirect(new URL("/sign-in", request.url));
//   }

//   // 3. Allow access to other pages (no redirect needed)
//   return NextResponse.next();
// }

// // Matching paths for the middleware
// export const config = {
//   matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*", "/verify/:path*"],
// };
