"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-client";

export default function CrmLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    // /crm resuelve server-side a /crm/[primera-zona-activa]/pizarron.
    // No hardcodeamos la zona acá porque el slug depende de qué zonas existan.
    router.push("/crm");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20">
            <Image
              src="/logo-mercedes-benz.png"
              alt="Mercedes-Benz"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
          CRM Mercedes-Benz
        </h1>
        <p className="text-slate-600 text-center mb-8 text-base">
          Ingresá con tu usuario para administrar clientes
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5 bg-white p-8 rounded-lg border border-slate-200 shadow-sm"
        >
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded text-base"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-base font-semibold text-slate-800 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-base bg-white border border-slate-300 text-slate-900 rounded focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-base font-semibold text-slate-800 mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-base bg-white border border-slate-300 text-slate-900 rounded focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 text-base font-semibold rounded hover:bg-slate-800 active:bg-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {loading ? "Ingresando..." : "Ingresar al CRM"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Sos administrador de vehículos?{" "}
          <a
            href="/admin/login"
            className="text-slate-800 underline hover:text-slate-950"
          >
            Ingresar al panel de admin
          </a>
        </p>
      </div>
    </div>
  );
}
