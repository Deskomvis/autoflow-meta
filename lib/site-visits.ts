import { requestSupabase } from "@/lib/membership-access";

export async function recordSiteVisit(input: {
  visitorId: string | null;
  ip: string | null;
  userAgent: string | null;
  path: string;
  referrer: string | null;
}) {
  const response = await requestSupabase("site_visits", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      visitor_id: input.visitorId,
      ip: input.ip,
      user_agent: input.userAgent,
      path: input.path,
      referrer: input.referrer,
    }),
  });

  if (!response || response.ok) return;

  console.warn(
    "site-visit-record-failed",
    JSON.stringify({ status: response.status, body: await response.text().catch(() => "") }),
  );
}
