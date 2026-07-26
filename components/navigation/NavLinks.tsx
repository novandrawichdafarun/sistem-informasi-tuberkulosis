import Link from "next/link";
import type { ReactElement } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => ReactElement;
};

export function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export default function NavLinks({
  pathname,
  onNavigate,
  nav,
}: {
  pathname: string;
  nav: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {nav.map((item) => {
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
