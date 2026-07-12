import { getDaftarPasienAction } from "@/actions/pasien";
import Link from "next/link";
import { PasienData } from "@/types/pasien";
import TambahPasienModal from "@/components/pasien/TambahPasienModal";
import { hitungUmur } from "@/utils/date";
import EditPasienModal from "@/components/pasien/EditPasienModal";
import DeletePasienButton from "@/components/pasien/DeletePasienButton";

export const metadata = {
  title: "Manajemen Pasien | PantauTB",
};

export default async function ManajemenPasienPage() {
  const response = await getDaftarPasienAction();
  const pasienList = (response.data as PasienData[]) || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Bagian Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Manajemen Pasien
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Daftar seluruh pasien TB yang berada di bawah pantauan Anda.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {/* Tombol Tambah Pasien */}
          <TambahPasienModal />
        </div>
      </div>

        {/* Bagian Tabel (Bawaan Tailwind UI) */}
        {response.success === false ? (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-600">{response.message}</p>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      No. RM
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Nama Pasien & Umur
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      NIK / L/P
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Kontak
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Fisik Awal
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-gray-900"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pasienList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-sm text-gray-500"
                      >
                        Belum ada pasien yang didaftarkan.
                      </td>
                    </tr>
                  ) : (
                    pasienList.map((pasien) => (
                      <tr
                        key={pasien.id_pasien}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-600 sm:pl-6">
                          {pasien.no_rm || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                          {pasien.nama_lengkap} <br />
                          <span className="text-xs font-normal text-gray-500">
                            {hitungUmur(pasien.tanggal_lahir)} Tahun
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {pasien.nik} <br />
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 mt-1 inline-block">
                            {pasien.jenis_kelamin === "L"
                              ? "Laki-laki"
                              : "Perempuan"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {pasien.no_telp || "-"} <br />
                          <span className="text-xs text-gray-400">
                            {pasien.users?.email}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          TB:{" "}
                          {pasien.tinggi_badan_awal
                            ? `${pasien.tinggi_badan_awal} cm`
                            : "-"}{" "}
                          <br />
                          BB:{" "}
                          {pasien.berat_badan_awal
                            ? `${pasien.berat_badan_awal} kg`
                            : "-"}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-6">
                          <Link
                            href={`/dashboard/pasien/${pasien.id_pasien}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Detail
                            <span className="sr-only">
                              , {pasien.nama_lengkap}
                            </span>
                          </Link>

                          <EditPasienModal pasien={pasien} />

                          <DeletePasienButton
                            id_pasien={pasien.id_pasien}
                            nama={pasien.nama_lengkap}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
