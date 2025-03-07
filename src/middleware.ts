import { auth } from "@/auth"
import { NextResponse } from 'next/server'
import { privateRoutes } from "./routes"


export default auth(async (req) => {
  // req.auth
  const isLoggedIn = !!req.auth;
  console.log("middleware called for ",req.nextUrl.pathname);
  console.log("auth stat ",isLoggedIn);
  
      // Redirect to login page if not authenticated
    if (!isLoggedIn && privateRoutes.includes(req.nextUrl.pathname) ) {
      return NextResponse.redirect(new URL('/', req.url))
    }
   

})
 
// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}