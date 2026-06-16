import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "sf_session";

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isAppRoute = request.nextUrl.pathname.startsWith("/app");

  if (isAppRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"]
};
