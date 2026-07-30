// Access gate. In Next 16 the `middleware` convention was renamed to `proxy`
// (see node_modules/next/dist/docs/.../file-conventions/proxy.md). This runs on
// the edge before the shop routes render and blocks anyone without a valid
// access session from even viewing the pieces.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, isDropOpen } from "@/lib/access/config";
import { verifySession } from "@/lib/access/session";

export async function proxy(request: NextRequest) {
  const session = await verifySession(request.cookies.get(ACCESS_COOKIE)?.value);
  const allowed = Boolean(session) && isDropOpen(Date.now());

  if (allowed) return NextResponse.next();

  // Block: send them to the code-entry page, remembering where they were headed.
  const url = request.nextUrl.clone();
  url.pathname = "/access";
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Only the shoppable surfaces are gated. Home/waitlist, /access, policies,
  // about, contact, API routes, and assets stay public.
  matcher: ["/shop", "/shop/:path*", "/collections/:path*", "/products/:path*"],
};
