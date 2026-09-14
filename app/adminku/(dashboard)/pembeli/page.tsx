"use client";

import { useEffect, useState } from "react";
import { formatIDR } from "@/lib/pricing";
import type { RangeKey } from "@/lib/adminku-data";
import { RangePicker } from "../range-picker";

type OrderRow = {
  reference: string;
  whatsapp_phone: string | null;
  amount: number | null;
  paid_at: string | null;
  affiliate_code: string | null;
};

const PAGE_SIZE = 25;

export default function AdminkuPembeliPage() {
  const [range, setRange] = useState<RangeKey>("all");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(0);
  }, [range]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/adminku/orders?range=${range}&page=${page}&pageSize=${PAGE_SIZE}`)
      .then((res) => res.json() as Promise<{ ok: boolean; rows: OrderRow[]; total: number }>)
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setRows(data.rows);
          setTotal(data.total);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const revenueOnPage = rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pembeli</h1>
          <p className="text-sm text-muted-foreground">{total} orang sudah membayar</p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Reference</th>
              <th className="px-3 py-2 font-medium">No. WhatsApp</th>
              <th className="px-3 py-2 font-medium">Jumlah</th>
              <th className="px-3 py-2 font-medium">Tanggal Bayar</th>
              <th className="px-3 py-2 font-medium">Kode Affiliate</th>
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
                  Belum ada pembeli.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.reference} className="border-t border-border/40">
                  <td className="px-3 py-2 font-mono text-xs">{row.reference}</td>
                  <td className="px-3 py-2">{row.whatsapp_phone ?? "-"}</td>
                  <td className="px-3 py-2">{formatIDR(row.amount ?? 0)}</td>
                  <td className="px-3 py-2">
                    {row.paid_at ? new Date(row.paid_at).toLocaleString("id-ID") : "-"}
                  </td>
                  <td className="px-3 py-2">{row.affiliate_code ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 ? (
            <tfoot>
              <tr className="border-t border-border/60 bg-muted/20 font-medium">
                <td className="px-3 py-2" colSpan={2}>
                  Total di halaman ini
                </td>
                <td className="px-3 py-2">{formatIDR(revenueOnPage)}</td>
                <td className="px-3 py-2" colSpan={2} />
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Halaman {page + 1} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}
