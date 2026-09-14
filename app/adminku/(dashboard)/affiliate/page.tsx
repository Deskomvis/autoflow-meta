"use client";

import { useEffect, useState } from "react";
import { formatIDR } from "@/lib/pricing";
import type { RangeKey } from "@/lib/adminku-data";
import { RangePicker } from "../range-picker";

type AffiliateRow = {
  affiliateCode: string;
  whatsappPhone: string;
  activatedAt: string;
  salesCount: number;
  revenueGenerated: number;
  commissionTotal: number;
};

export default function AdminkuAffiliatePage() {
  const [range, setRange] = useState<RangeKey>("all");
  const [rows, setRows] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/adminku/affiliates?range=${range}`)
      .then((res) => res.json() as Promise<{ ok: boolean; report: AffiliateRow[] }>)
      .then((data) => {
        if (cancelled) return;
        if (data.ok) setRows(data.report);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  const totalCommission = rows.reduce((sum, row) => sum + row.commissionTotal, 0);
  const totalSales = rows.reduce((sum, row) => sum + row.salesCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Penjualan Affiliate</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} affiliate · {totalSales} penjualan · total komisi{" "}
            {formatIDR(totalCommission)}
          </p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Kode Affiliate</th>
              <th className="px-3 py-2 font-medium">No. WhatsApp</th>
              <th className="px-3 py-2 font-medium">Jumlah Penjualan</th>
              <th className="px-3 py-2 font-medium">Revenue Dibawa</th>
              <th className="px-3 py-2 font-medium">Total Komisi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Memuat data...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Belum ada affiliate aktif.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.affiliateCode} className="border-t border-border/40">
                  <td className="px-3 py-2 font-mono text-xs">{row.affiliateCode}</td>
                  <td className="px-3 py-2">{row.whatsappPhone}</td>
                  <td className="px-3 py-2">{row.salesCount}</td>
                  <td className="px-3 py-2">{formatIDR(row.revenueGenerated)}</td>
                  <td className="px-3 py-2">{formatIDR(row.commissionTotal)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
