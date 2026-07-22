import Logo from "@/components/asset/Logo";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-brand-50 via-white to-mint-300/20 px-4 py-12">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl"
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <Logo size="xl" badge />
          <span className="mt-4 text-2xl font-bold tracking-tight text-brand-800">
            Pantau<span className="text-brand-500">TB</span>
          </span>
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-brand-900/50"></p>
      </div>
    </div>
  );
}
