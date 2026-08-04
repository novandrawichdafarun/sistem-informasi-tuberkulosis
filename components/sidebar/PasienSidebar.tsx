"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PillIcon,
  TrendIcon,
  MenuIcon,
  CloseIcon,
  PemeriksaanKlinisIcon,
  PemeriksaanLabIcon,
  ClipboardIcon,
} from "../asset/icons";
import LogoutButton from "../buttons/LogoutButton";
import Brand from "../molecules/Brand";
import NavLinks, { isActive, type NavItem } from "../navigation/NavLinks";

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
  {
    label: "Laporan Makanan",
    href: "/dashboard/laporan-makan",
    icon: ClipboardIcon,
  },
  {
    label: "Pemeriksaan Klinis",
    href: "/dashboard/pemeriksaan-klinis",
    icon: PemeriksaanKlinisIcon,
  },
  {
    label: "Pemeriksaan Medis",
    href: "/dashboard/pemeriksaan-lab",
    icon: PemeriksaanLabIcon,
  },
];

const STORAGE_KEY = "pantautb:pasien-sidebar-open";
const DESKTOP_KEY = "pantautb:pasien-sidebar-desktop";

export default function PasienSidebar({
  user,
  children,
}: {
  user: { name: string; roleLabel: string; phase?: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggle = (next: boolean) => {
    setOpen(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

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
    "Beranda";
  const initial = user.name.trim().charAt(0).toUpperCase() || "P";

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
        onClick={() => toggle(false)}
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
            onClick={() => toggle(false)}
            aria-label="Tutup menu"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <NavLinks
          pathname={pathname}
          nav={NAV}
          onNavigate={() => toggle(false)}
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
                onClick={() => toggle(true)}
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
                  {user.phase ? ` · ${user.phase}` : ""}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
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
