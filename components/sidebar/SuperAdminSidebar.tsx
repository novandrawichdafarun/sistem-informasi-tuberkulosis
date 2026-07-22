"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Manajemen Pasien", href: "/dashboard/pasien" },
    { name: "Episode Pengobatan", href: "/dashboard/episode-pengobatan" },
    { name: "Pemeriksaan Klinis", href: "/dashboard/pemeriksaan-klinis" },
    { name: "Pemeriksaan Lab", href: "/dashboard/pemeriksaan-lab" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">PantauTB Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
