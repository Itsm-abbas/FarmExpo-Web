import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.headers
    .get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const { pathname } = req.nextUrl;

  // 🔹 Allow access to login and signup pages only if there is NO token
  if ((pathname === "/auth/login" || pathname === "/auth/signup") && token) {
    return NextResponse.redirect(new URL("/", req.url)); // Redirect logged-in users to home
  }

  // 🔹 Block access to all other pages if there is NO token
  if (!token && !pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/auth/login", req.url)); // Redirect unauthenticated users
  }

  return NextResponse.next();
}

// 🔹 Apply middleware to all pages except public assets
export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
