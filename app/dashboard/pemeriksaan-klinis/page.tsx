import React from "react";
import { getDaftarPemeriksaanAction } from "@/actions/pemeriksaanKlinis";
import PemeriksaanRowView from "@/components/pemeriksaanKlinis/PemeriksaanRowView";

export default async function PemeriksaanKlinisPage() {
  const res = await getDaftarPemeriksaanAction();
  const daftarPemeriksaan = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Manajemen Pemeriksaan Klinis
        </h1>
        <p className="text-sm text-gray-500">
          Kelola riwayat pemeriksaan fisik dan klinis pasien Tuberkulosis di
          bawah penanganan Anda.
        </p>
      </div>

      {res.success === false && (
        <div className="rounded bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {res.error || "Gagal memuat data."}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">No. RM / NIK</th>
                <th className="px-6 py-3">Nama Pasien</th>
                <th className="px-6 py-3">Status Episode</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daftarPemeriksaan.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Belum ada data pasien terdaftar di bawah penanganan Anda.
                  </td>
                </tr>
              ) : (
                daftarPemeriksaan.map((item) => (
                  <PemeriksaanRowView key={item.id_pasien} item={item} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
