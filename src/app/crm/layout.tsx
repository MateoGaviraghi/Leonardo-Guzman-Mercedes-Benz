import type { ReactNode } from "react";
import { ToastProvider } from "@/components/crm/Toast";

/**
 * Layout raíz del CRM: solo provee el contexto de Toasts + wrapper visual.
 *
 * La autenticación la hace el middleware — redirige a /crm/login
 * cualquier ruta de /crm/* que no sea el propio login y no tenga sesión.
 * Si pusieramos un redirect acá también, entraría en loop al renderizar
 * /crm/login (porque este layout se aplica a TODO /crm/* incluyendo login).
 *
 * El "chrome" (header con ZonaSelector + ZoneSwitcher + search + overdue)
 * se arma en /crm/[zona]/layout.tsx, porque depende de la zona activa.
 */
export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-clip">
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
