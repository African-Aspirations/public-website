"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "@/hooks/use-auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { onLogin, onLogout } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    // Middleware already blocks unauthenticated requests to this route at
    // the edge; this call exists to (a) hydrate the signed-in user's info
    // client-side after a hard refresh, since the session cookie is
    // httpOnly and unreadable from JS, and (b) act as a second check in
    // case that ever changes.
    const verify = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        if (!active) return;
        onLogin(response.data.user);
      } catch {
        if (!active) return;
        onLogout();
        router.replace("/auth/login");
      } finally {
        if (active) setChecked(true);
      }
    };

    void verify();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8f4]">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
