import { type NextRequest, NextResponse } from "next/server";
import { client } from "./lib/rpc-client";

const publicRoutes = ["/start"];

export async function middleware(request: NextRequest) {
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const cookieHeader = request.cookies.toString();
  try {
    const res = await client.user.$get(
      {},
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
    );
    if (!res.ok) {
      let msg = "";
      try {
        const body = await res.json();
        msg = body?.message ?? "";
      } catch {
        msg = "ユーザー情報の取得に失敗しました";
      }
      console.error(res.status, msg);
      return NextResponse.redirect(new URL("/start", request.url));
    }
    return NextResponse.next();
  } catch (err) {
    console.error("auth check failed in middleware:", err);
    return NextResponse.redirect(new URL("/start", request.url));
  }
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
