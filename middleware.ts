import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRolePath } from "./app/lib/getRolePath";

// Role-based access control mapping
const rolePaths: Record<string, string[]> = {
  student: ["/dashboard/student"],
  asisten: ["/dashboard/asisten"],
  dosen: ["/dashboard/dosen"],
  admin: ["/dashboard/admin"],
  superadmin: ["/dashboard/superadmin"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ambil cookies untuk token dan role
  const accessToken = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("user_role")?.value;

  const userRole = getRolePath(role);

  // Redirect ke login jika tidak ada token atau role
  if (!accessToken || !userRole) {
    return NextResponse.redirect(new URL("/masuk", request.url));
  }

  // Validasi akses berdasarkan role
  const allowedPaths = rolePaths[userRole as keyof typeof rolePaths] || [];
  if (!allowedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next(); // Izinkan request jika valid
}

// Terapkan middleware untuk route tertentu saja
export const config = {
  matcher: ["/dashboard/:path*"], // Middleware akan diterapkan pada semua halaman di bawah /dashboard
};
