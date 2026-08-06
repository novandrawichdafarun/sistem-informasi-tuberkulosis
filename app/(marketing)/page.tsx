import Link from "next/link";
import Logo from "@/components/asset/Logo";
import PointerSpotlight from "@/components/marketing/PointerSpotlight";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const features = [
  {
    title: "Pelaporan Mandiri",
    desc: "Catat kepatuhan minum obat dan pola makan harian langsung dari genggaman pasien.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
      />
    ),
  },
  {
    title: "Pemantauan Kepatuhan",
    desc: "Petugas memantau progres pengobatan setiap pasien secara real-time dan terukur.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
      />
    ),
  },
  {
    title: "Kalender Pengobatan",
    desc: "Visualisasi kepatuhan bulanan agar pasien tak melewatkan satu obat pun.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    ),
  },
];

// Judul hero dipecah per-kata agar bisa dianimasikan muncul berurutan.
const heroWords = [
  "Dampingi",
  "Setiap",
  "Langkah",
  "Kesembuhan",
  "Pasien",
  "Tuberkulosis",
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-brand-50 via-white to-mint-300/20">
      {/* Spotlight mengikuti pointer (mouse & sentuhan) */}
      <PointerSpotlight />

      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl"
      />
      {/* Pola titik halus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--brand-300) 1px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, black 25%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 30%, black 25%, transparent 72%)",
        }}
      />

      {/* Header */}
      <header className="animate-fade-up relative z-10 mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-6">
        <Logo size="md" />
        <span className="text-xl font-bold tracking-tight text-brand-800">
          NU-TB<span className="text-brand-500">Care</span>
        </span>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-brand-800 sm:text-5xl">
          {heroWords.map((word, i) => {
            const highlight = word === "Kesembuhan";
            return (
              <span
                key={word}
                className="animate-fade-up mr-[0.25em] inline-block"
                style={{ animationDelay: `${0.1 + i * 0.09}s` }}
              >
                {highlight ? (
                  <span className="animate-text-shimmer bg-linear-to-r from-brand-600 via-brand-300 to-brand-600 bg-clip-text text-transparent">
                    {word}
                  </span>
                ) : (
                  word
                )}
              </span>
            );
          })}
        </h1>

        <p
          className="animate-fade-up mt-5 max-w-2xl text-base leading-7 text-brand-900/60 sm:text-lg"
          style={{ animationDelay: "0.7s" }}
        >
          NU-TBCare membantu pasien melaporkan kepatuhan pengobatan secara
          mandiri dan memudahkan petugas memantau perkembangannya semua dalam
          satu sistem sederhana.
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "0.82s" }}
        >
          <Link
            href="/login"
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-8 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 sm:w-auto"
          >
            Masuk
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group animate-fade-up h-full rounded-2xl border border-white/60 bg-white/50 p-6 text-left shadow-lg shadow-brand-900/5 ring-1 ring-white/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200/70 hover:bg-white/70 hover:shadow-xl hover:shadow-brand-900/10"
              style={{ animationDelay: `${0.9 + i * 0.1}s` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-brand-100 to-mint-300/40 text-brand-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-6 w-6"
                >
                  {f.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-brand-800">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-brand-900/60">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
