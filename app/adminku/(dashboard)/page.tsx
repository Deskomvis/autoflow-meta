"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIDR } from "@/lib/pricing";
import type { RangeKey } from "@/lib/adminku-data";
import { RangePicker } from "./range-picker";

type Stats = {
  uniqueVisitors: number;
  totalVisits: number;
  checkoutClicks: number;
  paidCount: number;
  revenue: number;
  conversionRate: number;
  visitToCheckoutRate: number;
};

type SeriesPoint = {
  date: string;
  uniqueVisitors: number;
  checkoutClicks: number;
  paid: number;
  revenue: number;
};

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function AdminkuOverviewPage() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [stats, setStats] = useState<Stats | null>(null);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetch(`/api/adminku/stats?range=${range}`).then(
        (res) => res.json() as Promise<{ ok: boolean; stats: Stats }>,
      ),
      fetch(`/api/adminku/visits?range=${range}`).then(
        (res) => res.json() as Promise<{ ok: boolean; series: SeriesPoint[] }>,
      ),
    ])
      .then(([statsRes, visitsRes]) => {
        if (cancelled) return;
        if (statsRes.ok) setStats(statsRes.stats);
        if (visitsRes.ok) setSeries(visitsRes.series);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Overview</h1>
        <RangePicker value={range} onChange={setRange} />
      </div>

      {loading && !stats ? (
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Unique Visitors" value={String(stats?.uniqueVisitors ?? 0)} />
            <StatCard label="Checkout Clicks" value={String(stats?.checkoutClicks ?? 0)} />
            <StatCard label="Paid Customers" value={String(stats?.paidCount ?? 0)} />
            <StatCard
              label="Conversion Rate"
              value={`${((stats?.conversionRate ?? 0) * 100).toFixed(1)}%`}
              hint="paid / checkout clicks"
            />
            <StatCard label="Revenue" value={formatIDR(stats?.revenue ?? 0)} />
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-4">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">
              Unique visitors, checkout & paid per hari
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    labelFormatter={(label) => `Tanggal ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="uniqueVisitors"
                    name="Unique Visitors"
                    stroke="var(--color-chart-1, #6366f1)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkoutClicks"
                    name="Checkout Clicks"
                    stroke="var(--color-chart-2, #f59e0b)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="paid"
                    name="Paid"
                    stroke="var(--color-chart-3, #22c55e)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
