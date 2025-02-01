import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token"); // Check for a valid token
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login
  }
  return NextResponse.next(); // Allow access
}
