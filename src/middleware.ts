import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE } from "@/lib/session-token";
import { jwtSecretBytes } from "@/lib/jwt-secret";

function isProtected(path: string) {
  return path.startsWith("/hesabim") || path.startsWith("/odeme");
}

function isAdmin(path: string) {
  return path.startsWith("/admin");
}

/** Herkese açık yönetici giriş sayfası */
function isAdminLoginPath(path: string) {
  return path === "/admin/giris" || path.startsWith("/admin/giris/");
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (isAdminLoginPath(path)) {
    return NextResponse.next();
  }

  if (!isProtected(path) && !isAdmin(path)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    if (isAdmin(path)) {
      url.pathname = "/admin/giris";
      url.searchParams.set("next", path + request.nextUrl.search);
    } else {
      url.pathname = "/giris";
      url.searchParams.set("next", path + request.nextUrl.search);
    }
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecretBytes());
    const role = payload.role;
    if (isAdmin(path)) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } else if (role !== "CUSTOMER" && role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/giris";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    if (isAdmin(path)) {
      url.pathname = "/admin/giris";
      url.searchParams.set("next", path + request.nextUrl.search);
    } else {
      url.pathname = "/giris";
      url.searchParams.set("next", path + request.nextUrl.search);
    }
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/hesabim/:path*", "/odeme", "/odeme/:path*", "/admin/:path*"],
};
