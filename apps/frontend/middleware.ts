import { type NextRequest, NextResponse } from "next/server";
import { client } from "./lib/rpc-client";

const publicRoutes = ["/start"];

export async function middleware(request: NextRequest) {
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const authenticated = await client.user.$get(
    {},
    {
      headers: {
        Cookie: request.cookies.toString(),
      },
    },
  );
  if (authenticated.status !== 200) {
    console.error(authenticated.status, (await authenticated.json()).message);
    return NextResponse.redirect(new URL("/start", request.url));
  }
  if (authenticated.status === 200 && !isPublicRoute) {
    return NextResponse.next();
  }

  console.log("redirecting to start", await authenticated.json());

  return NextResponse.redirect(new URL("/start", request.url));
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
