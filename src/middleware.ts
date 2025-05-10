import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from 'next/server';
import { privateRoutes } from "./routes";

export async function middleware(req:NextRequest) {
  // Fetch the JWT token from the request
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  console.log("middleware called for ", req.nextUrl.pathname);
  console.log("auth stat ", token ? "Logged In" : "Not Logged In");

  // Redirect to login page if not authenticated and trying to access private routes
  if (!token && (privateRoutes.includes(req.nextUrl.pathname) || req.nextUrl.pathname == "/" )) {
    return NextResponse.redirect(new URL('/login', req.url));
  }


  // if already logged in and in loginpage, redirect to home page
  if (token && (req.nextUrl.pathname == "/login" ||req.nextUrl.pathname == "/")) {
    return NextResponse.redirect(new URL('/home', req.url));
  }
  // if already logged in and in root, redirect to home page
  if (token && req.nextUrl.pathname == "/") {
    return NextResponse.redirect(new URL('/home', req.url));
  }
  // If authenticated, proceed to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
