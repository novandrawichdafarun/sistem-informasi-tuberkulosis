"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PasienData } from "@/types/pasien";
import TableSearchInput from "@/components/molecules/TableSearchInput";
import EditPasienModal from "./EditPasienModal";
import DeletePasienButton from "./DeletePasienButton";
import { DetailIcon } from "@/components/asset/icons";
import TambahPasienModal from "./TambahPasienModal";

export default function PasienTableView({ data }: { data: PasienData[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.nama_lengkap.toLowerCase().includes(q) ||
        (p.domisili || "").toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="w-auto sm:flex-1">
          <TableSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Cari nama / domisili pasien..."
          />
        </div>
        <div className="flex justify-end w-auto">
          <TambahPasienModal />
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
                  Nama Pasien & Usia
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Jenis Kelamin
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Domisili
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Pendidikan & Pekerjaan
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Pendapatan & Kontak
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
                    colSpan={7}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    {data.length === 0
                      ? "Belum ada pasien yang didaftarkan."
                      : "Pasien tidak ditemukan."}
                  </td>
                </tr>
              ) : (
                filtered.map((pasien) => (
                  <tr
                    key={pasien.id_pasien}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 font-medium sm:pl-6">
                      {pasien.nama_lengkap} <br />
                      <span className="text-xs font-normal text-gray-500">
                        {pasien.usia || "-"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 inline-block">
                        {pasien.jenis_kelamin === "L"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 max-w-56">
                      {pasien.domisili || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {pasien.pendidikan || "-"} <br />
                      <span className="text-xs text-gray-400">
                        {pasien.pekerjaan || "-"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {pasien.pendapatan || "-"} <br />
                      <span className="text-xs text-gray-400">
                        {pasien.no_telp || "-"}
                      </span>
                    </td>
                    <td className="py-4 px-3 sm:pr-6 align-middle">
                      <div className="flex justify-center items-center gap-2">
                        <Link
                          href={`/dashboard/pasien/${pasien.id_pasien}`}
                          title="Detail Pasien"
                          className="flex p-2 items-center bg-blue-100 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition shadow-sm"
                        >
                          <DetailIcon className="w-4 h-4" />
                        </Link>
                        <EditPasienModal pasien={pasien} />
                        <DeletePasienButton
                          id_pasien={pasien.id_pasien}
                          nama={pasien.nama_lengkap}
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
