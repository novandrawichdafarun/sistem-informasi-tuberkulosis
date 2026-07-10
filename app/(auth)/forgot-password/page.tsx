"use client";

import { useState } from "react";
import { requestOtpAction, resetPasswordAction } from "@/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestOtp = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const inputEmail = formData.get("email") as string;
    const result = await requestOtpAction(formData);

    if (result?.error) {
      setErrorMessage(result.error);
      setIsLoading(false);
    } else {
      setEmail(inputEmail);
      setStep(2);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await resetPasswordAction(formData);

    if (result?.error) {
      setErrorMessage(result.error);
      setIsLoading(false);
    } else {
      setStep(3);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg border border-gray-100">
        {/* Judul Halaman */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Pemulihan Kata Sandi
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 && "Masukkan email yang terdaftar pada sistem."}
            {step === 2 &&
              "Periksa kotak masuk email Anda untuk melihat kode verifikasi 6 digit."}
            {step === 3 && "Selesai!"}
          </p>
        </div>

        {/* Tampilkan Pesan Error Global */}
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {/* --- FASE 1: Form Input Email --- */}
        {step === 1 && (
          <form action={handleRequestOtp} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="pasien@email.com"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Mengirim Kode..." : "Kirim Kode Verifikasi"}
            </button>

            <div className="text-center mt-4">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Kembali ke halaman Login
              </Link>
            </div>
          </form>
        )}

        {/* --- FASE 2: Form Input OTP & Sandi Baru --- */}
        {step === 2 && (
          <form action={handleResetPassword} className="space-y-4">
            {/* Input Tersembunyi untuk Email (Agar terkirim ke Server Action) */}
            <input type="hidden" name="email" value={email} />

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="token"
              >
                Kode 6 Digit
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-center tracking-widest placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="newPassword"
              >
                Kata Sandi Baru
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                placeholder="Minimal 6 karakter"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
            </button>

            <div className="text-center mt-4 text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-700"
              >
                Salah ketik email? Kembali
              </button>
            </div>
          </form>
        )}

        {/* --- FASE 3: Pesan Sukses --- */}
        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-700">
                Selamat! Kata sandi Anda berhasil diperbarui.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Masuk ke Aplikasi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
