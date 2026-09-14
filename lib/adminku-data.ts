import { requestSupabase } from "@/lib/membership-access";
import { maskPhone } from "@/lib/affiliate";

export type RangeKey = "7d" | "30d" | "90d" | "all";

export function rangeToSince(range: RangeKey): string | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return since.toISOString();
}

async function readRows<T>(response: Response | null, context: string): Promise<T[]> {
  if (!response) return [];
  if (!response.ok) {
    console.warn(
      `adminku-${context}-failed`,
      JSON.stringify({ status: response.status, body: await response.text().catch(() => "") }),
    );
    return [];
  }
  return ((await response.json().catch(() => [])) as T[]) ?? [];
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

type VisitRow = { visitor_id: string | null; ip: string | null; created_at: string };
type OrderRow = {
  reference: string;
  status: "pending" | "paid";
  amount: number | null;
  whatsapp_phone: string | null;
  affiliate_code: string | null;
  commission_amount: number | null;
  created_at: string;
  paid_at: string | null;
};

async function fetchVisitRows(since: string | null): Promise<VisitRow[]> {
  const filter = since ? `&created_at=gte.${encodeURIComponent(since)}` : "";
  const response = await requestSupabase(
    `site_visits?select=visitor_id,ip,created_at${filter}&order=created_at.asc`,
    { method: "GET", headers: { Prefer: "" } },
  );
  return readRows<VisitRow>(response, "visits");
}

async function fetchOrderRows(since: string | null): Promise<OrderRow[]> {
  const filter = since ? `&created_at=gte.${encodeURIComponent(since)}` : "";
  const response = await requestSupabase(
    `membership_access?select=reference,status,amount,whatsapp_phone,affiliate_code,commission_amount,created_at,paid_at${filter}&order=created_at.asc`,
    { method: "GET", headers: { Prefer: "" } },
  );
  return readRows<OrderRow>(response, "orders");
}

export async function getSummaryStats(range: RangeKey) {
  const since = rangeToSince(range);
  const [visits, orders] = await Promise.all([fetchVisitRows(since), fetchOrderRows(since)]);

  const uniqueVisitors = new Set(
    visits.map((row) => row.visitor_id ?? row.ip ?? `unknown-${row.created_at}`),
  ).size;
  const checkoutClicks = orders.length;
  const paidOrders = orders.filter((row) => row.status === "paid");
  const paidCount = paidOrders.length;
  const revenue = paidOrders.reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const conversionRate = checkoutClicks > 0 ? paidCount / checkoutClicks : 0;
  const visitToCheckoutRate = uniqueVisitors > 0 ? checkoutClicks / uniqueVisitors : 0;

  return {
    uniqueVisitors,
    totalVisits: visits.length,
    checkoutClicks,
    paidCount,
    revenue,
    conversionRate,
    visitToCheckoutRate,
  };
}

export async function getDailySeries(range: RangeKey) {
  const since =
    rangeToSince(range) ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const [visits, orders] = await Promise.all([fetchVisitRows(since), fetchOrderRows(since)]);

  const days = new Map<
    string,
    { date: string; visitors: Set<string>; checkoutClicks: number; paid: number; revenue: number }
  >();

  const ensureDay = (date: string) => {
    let entry = days.get(date);
    if (!entry) {
      entry = { date, visitors: new Set(), checkoutClicks: 0, paid: 0, revenue: 0 };
      days.set(date, entry);
    }
    return entry;
  };

  for (const row of visits) {
    const entry = ensureDay(dayKey(row.created_at));
    entry.visitors.add(row.visitor_id ?? row.ip ?? `unknown-${row.created_at}`);
  }

  for (const row of orders) {
    const entry = ensureDay(dayKey(row.created_at));
    entry.checkoutClicks += 1;
    if (row.status === "paid") {
      entry.paid += 1;
      entry.revenue += row.amount ?? 0;
    }
  }

  return Array.from(days.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: entry.date,
      uniqueVisitors: entry.visitors.size,
      checkoutClicks: entry.checkoutClicks,
      paid: entry.paid,
      revenue: entry.revenue,
    }));
}

export async function getPaidCustomers(input: { page: number; pageSize: number; range: RangeKey }) {
  const since = rangeToSince(input.range);
  const filter = since ? `&paid_at=gte.${encodeURIComponent(since)}` : "";
  const from = input.page * input.pageSize;
  const to = from + input.pageSize - 1;

  const response = await requestSupabase(
    `membership_access?status=eq.paid&select=reference,whatsapp_phone,amount,paid_at,affiliate_code${filter}&order=paid_at.desc`,
    {
      method: "GET",
      headers: { Prefer: "", Range: `${from}-${to}` },
    },
  );

  if (!response) return { rows: [], total: 0 };
  if (!response.ok && response.status !== 206) {
    console.warn("adminku-paid-customers-failed", JSON.stringify({ status: response.status }));
    return { rows: [], total: 0 };
  }

  const rows =
    ((await response.json().catch(() => [])) as {
      reference: string;
      whatsapp_phone: string | null;
      amount: number | null;
      paid_at: string | null;
      affiliate_code: string | null;
    }[]) ?? [];

  const contentRange = response.headers.get("content-range");
  const total = Number(contentRange?.split("/").at(1)) || rows.length;

  return { rows, total };
}

export async function getAffiliateSalesReport(range: RangeKey) {
  const since = rangeToSince(range);
  const orderFilter = since ? `&paid_at=gte.${encodeURIComponent(since)}` : "";

  const [affiliateResponse, orderResponse] = await Promise.all([
    requestSupabase("affiliate?select=owner_reference,affiliate_code,whatsapp_phone,activated_at", {
      method: "GET",
      headers: { Prefer: "" },
    }),
    requestSupabase(
      `membership_access?status=eq.paid&affiliate_code=not.is.null&select=affiliate_code,amount,commission_amount,paid_at${orderFilter}`,
      { method: "GET", headers: { Prefer: "" } },
    ),
  ]);

  const affiliates = await readRows<{
    owner_reference: string;
    affiliate_code: string;
    whatsapp_phone: string;
    activated_at: string;
  }>(affiliateResponse, "affiliate-list");

  const sales = await readRows<{
    affiliate_code: string;
    amount: number | null;
    commission_amount: number | null;
    paid_at: string | null;
  }>(orderResponse, "affiliate-sales");

  const salesByCode = new Map<string, { count: number; revenue: number; commission: number }>();
  for (const sale of sales) {
    const key = sale.affiliate_code;
    const entry = salesByCode.get(key) ?? { count: 0, revenue: 0, commission: 0 };
    entry.count += 1;
    entry.revenue += sale.amount ?? 0;
    entry.commission += sale.commission_amount ?? 0;
    salesByCode.set(key, entry);
  }

  return affiliates
    .map((affiliate) => {
      const stats = salesByCode.get(affiliate.affiliate_code) ?? {
        count: 0,
        revenue: 0,
        commission: 0,
      };
      return {
        affiliateCode: affiliate.affiliate_code,
        whatsappPhone: maskPhone(affiliate.whatsapp_phone),
        activatedAt: affiliate.activated_at,
        salesCount: stats.count,
        revenueGenerated: stats.revenue,
        commissionTotal: stats.commission,
      };
    })
    .sort((a, b) => b.commissionTotal - a.commissionTotal);
}
