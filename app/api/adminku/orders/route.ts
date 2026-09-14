import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminku-auth";
import { getPaidCustomers, type RangeKey } from "@/lib/adminku-data";

export const runtime = "nodejs";

const RANGES: RangeKey[] = ["7d", "30d", "90d", "all"];

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedRange = url.searchParams.get("range");
  const range = RANGES.includes(requestedRange as RangeKey) ? (requestedRange as RangeKey) : "all";
  const page = Math.max(0, Number(url.searchParams.get("page")) || 0);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 25));

  const { rows, total } = await getPaidCustomers({ page, pageSize, range });
  return NextResponse.json({ ok: true, range, page, pageSize, total, rows });
}
