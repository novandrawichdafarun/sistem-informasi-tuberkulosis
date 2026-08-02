"use client";

import { SearchIcon } from "../asset/icons";

// Kotak pencarian bersama untuk tabel dashboard (dipakai di banyak halaman).
export default function TableSearchInput({
  value,
  onChange,
  placeholder = "Cari...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative max-w-sm">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
      />
    </div>
  );
}
