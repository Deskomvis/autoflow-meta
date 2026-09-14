"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
      onClick={async () => {
        await fetch("/api/adminku/logout", { method: "POST" });
        router.push("/adminku/login");
        router.refresh();
      }}
    >
      Logout
    </button>
  );
}
