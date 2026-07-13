"use client";

import { clearDbSessionAction } from "@/actions/auth";
import { signOut, useSession } from "next-auth/react";

export default function LogoutButton() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    if (session?.user?.sessionToken) {
      await clearDbSessionAction(session.user.sessionToken);
    }
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
    >
      Keluar
    </button>
  );
}
