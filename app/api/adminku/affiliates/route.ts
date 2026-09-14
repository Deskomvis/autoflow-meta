import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminku-auth";
import { getAffiliateSalesReport, type RangeKey } from "@/lib/adminku-data";

export const runtime = "nodejs";

const RANGES: RangeKey[] = ["7d", "30d", "90d", "all"];

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const requested = new URL(request.url).searchParams.get("range");
  const range = RANGES.includes(requested as RangeKey) ? (requested as RangeKey) : "all";

  const report = await getAffiliateSalesReport(range);
  return NextResponse.json({ ok: true, range, report });
}
