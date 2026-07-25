import { ChatIcon } from "@/components/dashboard/icons";

export const metadata = { title: "Chat Nakes | NU-TBCare" };

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Chat Nakes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Konsultasikan keluhan atau pertanyaan seputar pengobatan Anda dengan
          tenaga kesehatan.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ChatIcon className="h-7 w-7" />
        </div>
        <p className="text-lg font-semibold text-brand-950">
          Fitur chat belum tersedia
        </p>
        <p className="max-w-md text-sm text-slate-500">
          Fitur percakapan dengan tenaga kesehatan akan diaktifkan setelah tabel
          pesan disiapkan di database. Untuk saat ini silakan hubungi Nakes Anda
          melalui kontak yang tersedia.
        </p>
      </div>
    </div>
  );
}
