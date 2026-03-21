"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Painel", icon: "📊" },
  { href: "/admin/dizimo", label: "Dízimo", icon: "💰" },
  { href: "/admin/membros", label: "Membros", icon: "👥" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <aside
      className="admin-sidebar flex flex-col w-64 px-4 py-6 shrink-0"
      style={{ minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="text-4xl mb-2"
          style={{ color: "var(--gold)", fontFamily: "serif" }}
        >
          ✠
        </div>
        <h1
          className="text-white font-bold text-lg leading-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Santa Madalena
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--gold-light)" }}>
          Área Administrativa
        </p>
      </div>

      <hr className="gold-divider" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: active ? "rgba(201,168,76,0.25)" : "transparent",
                color: active ? "var(--gold-light)" : "rgba(255,255,255,0.75)",
                borderLeft: active ? "3px solid var(--gold)" : "3px solid transparent",
                fontWeight: active ? 600 : 400,
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <hr className="gold-divider" />

      {/* Footer */}
      <div className="mt-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg transition-all mb-2"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          ← Ver site público
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
