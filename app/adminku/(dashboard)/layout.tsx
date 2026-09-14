import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminku-auth";
import { LogoutButton } from "./logout-button";

const NAV_ITEMS = [
  { href: "/adminku", label: "Overview" },
  { href: "/adminku/pembeli", label: "Pembeli" },
  { href: "/adminku/affiliate", label: "Affiliate" },
];

export default async function AdminkuDashboardLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const authorized = verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value);

  if (!authorized) {
    redirect("/adminku/login");
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold tracking-tight">AutoFlow Admin</span>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
