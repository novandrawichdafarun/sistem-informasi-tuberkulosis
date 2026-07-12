"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  HomeIcon,
  PillIcon,
  BellIcon,
  TrendIcon,
  PulseIcon,
  ScaleIcon,
  ChatIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
} from "./icons";

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

// "Email Notifikasi" intentionally omitted per requirement.
const NAV: NavItem[] = [
  { label: "Beranda", href: "/dashboard", icon: HomeIcon },
  { label: "Laporan Obat Harian", href: "#", icon: PillIcon },
  { label: "Jadwal & Alarm", href: "#", icon: BellIcon },
  { label: "Riwayat Kepatuhan", href: "#", icon: TrendIcon },
  { label: "Tanda Vital", href: "#", icon: PulseIcon },
  { label: "Berat Badan", href: "#", icon: ScaleIcon },
  { label: "Chat Nakes", href: "#", icon: ChatIcon },
];

const STORAGE_KEY = "pantautb:pasien-sidebar-open";

export default function PatientShell({
  user,
  children,
}: {
  user: { name: string; roleLabel: string; phase?: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Restore persisted state after mount (avoids SSR/CSR hydration mismatch).
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = (next: boolean) => {
    setOpen(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const activeLabel =
    NAV.find((n) => n.href !== "#" && pathname === n.href)?.label ?? "Beranda";
  const initial = user.name.trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ---------- Top bar ---------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggle(true)}
              aria-label="Buka menu"
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <span className="text-base font-semibold text-brand-950">
              {activeLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-brand-950">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">
                {user.roleLabel}
                {user.phase ? ` · ${user.phase}` : ""}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {initial}
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Backdrop ---------- */}
      <div
        onClick={() => toggle(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ---------- Sidebar drawer ---------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <Image
            src="/logo.png"
            alt="Logo PantauTB"
            width={40}
            height={40}
            quality={100}
            className="shrink-0 rounded-xl"
          />
          <div className="leading-tight">
            <p className="font-bold text-brand-800">
              Pantau<span className="text-brand-500">TB</span>
            </p>
            <p className="text-xs text-slate-500">Monitoring TB</p>
          </div>
          <button
            type="button"
            onClick={() => toggle(false)}
            aria-label="Tutup menu"
            className="ml-auto rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 pt-4">
          <span className="inline-flex items-center rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
            {user.roleLabel}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const isActive = item.href !== "#" && pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => toggle(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-brand-700"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-brand-600" : "text-slate-400"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogoutIcon className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* ---------- Main content ---------- */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
