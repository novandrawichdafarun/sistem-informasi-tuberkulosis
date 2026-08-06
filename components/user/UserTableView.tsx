"use client";

import { UserData } from "@/types/user";
import { useEffect, useMemo, useState } from "react";
import TableSearchInput from "../molecules/TableSearchInput";
import DeleteUserButton from "./DeleteUserButton";
import EditUserModal from "./EditUserModal";
import TambahUserModal from "./TambahUserModal";

export default function UserTableView({ data }: { data: UserData[] }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedQuery(query.trim().toLowerCase()),
      500,
    );
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    const q = debouncedQuery;
    if (!q) return data;
    return data.filter((p) => p.email.toLowerCase().includes(q));
  }, [data, debouncedQuery]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="w-auto sm:flex-1">
          <TableSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Cari email user..."
          />
        </div>
        <div className="flex justify-end w-auto">
          <TambahUserModal />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Email user
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Role User
                </th>
                <th
                  scope="col"
                  className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-gray-900 text-center"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    {data.length === 0
                      ? "Belum ada User yang didaftarkan selain anda."
                      : "User tidak ditemukan."}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id_user}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 font-medium sm:pl-6">
                      {user.email}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 max-w-56">
                      {user.role}
                    </td>
                    <td className="py-4 px-3 sm:pr-6 align-middle">
                      <div className="flex justify-center items-center gap-2">
                        <EditUserModal user={user} />
                        <DeleteUserButton
                          id_user={user.id_user}
                          email={user.email}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
