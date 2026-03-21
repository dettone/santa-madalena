import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "santa-madalena-secret-key-2024",
);

const protectedPaths = ["/admin/dashboard", "/admin/dizimo", "/admin/membros"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("sm_admin_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/dizimo/:path*", "/admin/membros/:path*"],
};
