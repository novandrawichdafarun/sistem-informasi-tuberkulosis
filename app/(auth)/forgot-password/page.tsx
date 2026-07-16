"use client";

import { useState } from "react";
import {
  requestOtpAction,
  verifyOtpAction,
  resetPasswordAction,
} from "@/actions/auth";
import Link from "next/link";

const STEPS = [
  { id: 1, label: "Email" },
  { id: 2, label: "Verifikasi" },
  { id: 3, label: "Sandi Baru" },
] as const;

function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  const activeStep = step === 4 ? 3 : step;

  return (
    <div className="mb-2 flex items-center justify-center">
      {STEPS.map((s, idx) => {
        const isDone = activeStep > s.id || step === 4;
        const isActive = activeStep === s.id && step !== 4;

        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  isDone
                    ? "border-brand-600 bg-brand-600 text-white"
                    : isActive
                      ? "border-brand-600 bg-white text-brand-600"
                      : "border-brand-200 bg-white text-brand-300"
                }`}
              >
                {isDone ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <span
                className={`text-[11px] font-medium ${
                  isDone || isActive ? "text-brand-700" : "text-brand-300"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`mx-2 mb-4 h-0.5 w-10 rounded-full transition-colors sm:w-14 ${
                  activeStep > s.id || step === 4
                    ? "bg-brand-600"
                    : "bg-brand-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestOtp = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const inputEmail = formData.get("email") as string;
    const result = await requestOtpAction(formData);

    if (!result.success) {
      setErrorMessage(result.error);
    } else {
      setEmail(inputEmail);
      setStep(2);
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (FormData: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const inputToken = FormData.get("token") as string;
    const result = await verifyOtpAction(FormData);

    if (!result.success) {
      setErrorMessage(result.error);
    } else {
      setToken(inputToken);
      setStep(3);
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await resetPasswordAction(formData);

    if (!result.success) {
      setErrorMessage(result.error);
    } else {
      setStep(4);
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full space-y-6 rounded-2xl border border-brand-100 bg-white/90 p-8 shadow-xl shadow-brand-900/5 backdrop-blur-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-950">
          Pemulihan Kata Sandi
        </h1>
        <p className="mt-2 text-sm text-brand-900/60">
          {step === 1 && "Masukkan email yang terdaftar pada sistem."}
          {step === 2 && `Masukkan 6 digit kode yang dikirim ke ${email}`}
          {step === 3 && "Buat kata sandi baru untuk akun Anda."}
          {step === 4 && "Kata sandi berhasil diperbarui!"}
        </p>
      </div>

      <StepIndicator step={step} />

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-5 w-5 shrink-0 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* --- TAHAP 1: FORM EMAIL --- */}
      {step === 1 && (
        <form action={handleRequestOtp} className="space-y-4">
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-brand-950"
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
              className="block w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-950 placeholder-brand-900/30 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            {isLoading ? "Mengirim Kode..." : "Kirim Kode Verifikasi"}
          </button>
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Kembali ke halaman Login
            </Link>
          </div>
        </form>
      )}

      {/* --- TAHAP 2: FORM OTP --- */}
      {step === 2 && (
        <form action={handleVerifyOtp} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-brand-950"
              htmlFor="token"
            >
              Kode 6 Digit
            </label>
            <input
              id="token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              placeholder="123456"
              className="block w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-center text-lg font-semibold tracking-[0.5em] text-brand-950 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            {isLoading ? "Memeriksa..." : "Verifikasi Kode"}
          </button>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-brand-900/50 hover:text-brand-700"
            >
              Salah ketik email? Kembali
            </button>
          </div>
        </form>
      )}

      {/* --- TAHAP 3: FORM SANDI BARU --- */}
      {step === 3 && (
        <form action={handleResetPassword} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="token" value={token} />

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-brand-950"
              htmlFor="newPassword"
            >
              Kata Sandi Baru
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Minimal 6 karakter"
              className="block w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-950 placeholder-brand-900/30 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-brand-950"
              htmlFor="confirmPassword"
            >
              Konfirmasi Kata Sandi
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Ketik ulang kata sandi baru"
              className="block w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-950 placeholder-brand-900/30 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            {isLoading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
          </button>
        </form>
      )}

      {/* --- TAHAP 4: SUKSES --- */}
      {step === 4 && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-7 w-7 text-brand-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
          <div className="rounded-lg bg-brand-50 p-4">
            <p className="text-sm text-brand-800">
              Selamat! Kata sandi Anda berhasil diperbarui. Silakan login
              kembali menggunakan kata sandi yang baru.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md"
          >
            Ke Halaman Login
          </Link>
        </div>
      )}
    </div>
  );
}
