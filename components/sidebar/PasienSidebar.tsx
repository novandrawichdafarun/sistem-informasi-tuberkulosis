"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Logo from "@/components/asset/Logo";
import {
  HomeIcon,
  PillIcon,
  TrendIcon,
  PulseIcon,
  ScaleIcon,
  ChatIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
} from "../asset/icons";

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

const NAV: NavItem[] = [
  { label: "Beranda", href: "/dashboard", icon: HomeIcon },
  {
    label: "Laporan Obat Harian",
    href: "/dashboard/laporan-obat",
    icon: PillIcon,
  },
  {
    label: "Riwayat Kepatuhan",
    href: "/dashboard/riwayat-kepatuhan",
    icon: TrendIcon,
  },
  { label: "Tanda Vital", href: "/dashboard/tanda-vital", icon: PulseIcon },
  { label: "Berat Badan", href: "/dashboard/berat-badan", icon: ScaleIcon },
  { label: "Chat Nakes", href: "/dashboard/chat", icon: ChatIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
      <Logo size="md" badge />
      <div className="leading-tight">
        <p className="font-bold text-brand-800">
          NU-TB<span className="text-brand-500">Care</span>
        </p>
        <p className="text-xs text-slate-500">Monitoring TB</p>
      </div>
    </div>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-brand-700"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${active ? "text-brand-600" : "text-slate-400"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function RoleBadge({ label }: { label: string }) {
  return (
    <div className="px-5 pt-4">
      <span className="inline-flex items-center rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
        {label}
      </span>
    </div>
  );
}

function LogoutBtn() {
  return (
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
  );
}

const STORAGE_KEY = "pantautb:pasien-sidebar-open";

export default function PasienSidebar({
  user,
  children,
}: {
  user: { name: string; roleLabel: string; phase?: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Selalu mulai dari `false` agar cocok dengan HTML dari server.
  const [open, setOpen] = useState(false);

  // Pulihkan state tersimpan setelah mount (hindari hydration mismatch).
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
    [...NAV].reverse().find((n) => isActive(pathname, n.href))?.label ??
    "Beranda";
  const initial = user.name.trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {/* Sidebar tetap (desktop) */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex lg:sticky lg:top-0 lg:h-screen">
        <Brand />
        <RoleBadge label={user.roleLabel} />
        <NavLinks pathname={pathname} />
        <LogoutBtn />
      </aside>

      {/* Backdrop (mobile) */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer (mobile) */}
      <aside
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
        className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pr-3">
          <div className="flex-1">
            <Brand />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <RoleBadge label={user.roleLabel} />
        <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
        <LogoutBtn />
      </aside>

      {/* Kolom konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Buka menu"
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700 lg:hidden"
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

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
