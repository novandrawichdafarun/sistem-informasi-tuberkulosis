"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Logo from "@/components/Logo";
import {
  HomeIcon,
  PulseIcon,
  PillIcon,
  TrendIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
} from "./icons";
import {
  UsersIcon,
  CalendarIcon,
  FlaskIcon,
  PillBottleIcon,
} from "./adminIcons";

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

const NAV: NavItem[] = [
  { label: "Beranda", href: "/dashboard", icon: HomeIcon },
  { label: "Statistik", href: "/dashboard/statistik", icon: TrendIcon },
  { label: "Manajemen Pasien", href: "/dashboard/pasien", icon: UsersIcon },
  {
    label: "Episode Pengobatan",
    href: "/dashboard/episode-pengobatan",
    icon: CalendarIcon,
  },
  {
    label: "Pemeriksaan Klinis",
    href: "/dashboard/pemeriksaan-klinis",
    icon: PulseIcon,
  },
  {
    label: "Pemeriksaan Lab",
    href: "/dashboard/pemeriksaan-lab",
    icon: FlaskIcon,
  },
  { label: "Resep & Jadwal", href: "/dashboard/resep-obat", icon: PillIcon },
  { label: "Master Obat", href: "/dashboard/obat", icon: PillBottleIcon },
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
        <p className="text-xs text-slate-500">Panel Tenaga Kesehatan</p>
      </div>
    </div>
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

export default function AdminShell({
  user,
  children,
}: {
  user: { name: string; roleLabel: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeLabel =
    [...NAV].reverse().find((n) => isActive(pathname, n.href))?.label ??
    "Dashboard";
  const initial = user.name.trim().charAt(0).toUpperCase() || "N";

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {/* ---------- Sidebar tetap (desktop) ---------- */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex lg:sticky lg:top-0 lg:h-screen">
        <Brand />
        <RoleBadge label={user.roleLabel} />
        <NavLinks pathname={pathname} />
        <LogoutBtn />
      </aside>

      {/* ---------- Backdrop (mobile) ---------- */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ---------- Drawer (mobile) ---------- */}
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

      {/* ---------- Kolom konten ---------- */}
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
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm font-semibold text-brand-950">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.roleLabel}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Halaman-halaman admin sudah membawa container/padding-nya sendiri. */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
