"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/crm/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      title="Cerrar sesión y salir del CRM"
      aria-label="Cerrar sesión"
      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
    >
      <LogOut className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">
        {loading ? "Saliendo..." : "Cerrar sesión"}
      </span>
    </button>
  );
}
