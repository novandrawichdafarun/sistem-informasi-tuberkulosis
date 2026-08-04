"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PillIcon,
  TrendIcon,
  MenuIcon,
  CloseIcon,
  UsersIcon,
  CalendarIcon,
  PillBottleIcon,
  DiagnosisIcon,
  PemeriksaanLabIcon,
  PemeriksaanKlinisIcon,
  ClipboardIcon,
  AdminIcon,
} from "../asset/icons";
import Brand from "../molecules/Brand";
import LogoutButton from "../buttons/LogoutButton";
import NavLinks, { isActive, type NavItem } from "../navigation/NavLinks";

const NAV: NavItem[] = [
  { label: "Beranda", href: "/dashboard", icon: HomeIcon },
  { label: "Statistik", href: "/dashboard/statistik", icon: TrendIcon },
  { label: "Manajemen User", href: "/dashboard/user", icon: AdminIcon },
  { label: "Manajemen Pasien", href: "/dashboard/pasien", icon: UsersIcon },
  { label: "Master Obat", href: "/dashboard/obat", icon: PillBottleIcon },
  {
    label: "Episode Pengobatan",
    href: "/dashboard/episode-pengobatan",
    icon: CalendarIcon,
  },
  {
    label: "Pemeriksaan Klinis",
    href: "/dashboard/pemeriksaan-klinis",
    icon: PemeriksaanKlinisIcon,
  },
  {
    label: "Pemeriksaan Lab",
    href: "/dashboard/pemeriksaan-lab",
    icon: PemeriksaanLabIcon,
  },
  { label: "Diagnosis", href: "/dashboard/diagnosis", icon: DiagnosisIcon },
  { label: "Resep & Jadwal", href: "/dashboard/resep-obat", icon: PillIcon },
  {
    label: "Laporan Makanan",
    href: "/dashboard/laporan-makan",
    icon: ClipboardIcon,
  },
];

const DESKTOP_KEY = "pantautb:admin-sidebar-desktop";

export default function AdminSidebar({
  user,
  children,
}: {
  user: { name: string; roleLabel: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Sidebar desktop: default tampil, preferensi tersimpan.
  // Baca localStorage setelah mount agar tidak terjadi hydration mismatch.
  const [desktopOpen, setDesktopOpen] = useState(() => {
    if (typeof window === "undefined") return true;

    try {
      return localStorage.getItem(DESKTOP_KEY) !== "0";
    } catch {
      // ignore
    }
  });

  const toggleDesktop = () => {
    setDesktopOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(DESKTOP_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const activeLabel =
    [...NAV].reverse().find((n) => isActive(pathname, n.href))?.label ??
    "Dashboard";
  const initial = user.name.trim().charAt(0).toUpperCase() || "N";

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside
        className={`hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen ${
          desktopOpen ? "lg:flex" : "lg:hidden"
        }`}
      >
        <Brand />
        <NavLinks pathname={pathname} nav={NAV} />
        <LogoutButton />
      </aside>

      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

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
        <NavLinks
          pathname={pathname}
          nav={NAV}
          onNavigate={() => setOpen(false)}
        />
        <LogoutButton />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {/* Toggle sidebar mobile */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Buka menu"
                className="shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700 lg:hidden"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              {/* Toggle sidebar desktop (sembunyikan / tampilkan) */}
              <button
                type="button"
                onClick={toggleDesktop}
                aria-label={desktopOpen ? "Sembunyikan menu" : "Tampilkan menu"}
                title={desktopOpen ? "Sembunyikan menu" : "Tampilkan menu"}
                className="hidden shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700 lg:inline-flex"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <span className="truncate text-base font-semibold text-brand-950">
                {activeLabel}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden max-w-[40vw] text-right leading-tight sm:block">
                <p className="truncate text-sm font-semibold text-brand-950">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user.roleLabel}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {initial}
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
