import { NextResponse, type NextRequest } from "next/server";
import { recordSiteVisit } from "@/lib/site-visits";

const AFF_COOKIE_NAME = "afm_aff";
const AFF_CODE_RE = /^[A-Z0-9]{4,16}$/;

const VISITOR_COOKIE_NAME = "afm_vid";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const raw = request.nextUrl.searchParams.get("aff");
  if (raw) {
    const code = raw.trim().toUpperCase();
    if (AFF_CODE_RE.test(code)) {
      const days = Number(process.env.AFFILIATE_COOKIE_DAYS) || 30;
      response.cookies.set(AFF_COOKIE_NAME, code, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: days * 24 * 60 * 60,
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  let visitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value ?? null;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 400 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  recordSiteVisit({
    visitorId,
    ip,
    userAgent: request.headers.get("user-agent"),
    path: request.nextUrl.pathname,
    referrer: request.headers.get("referer"),
  }).catch(() => {});

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
