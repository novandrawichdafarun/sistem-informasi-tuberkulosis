"use client";

import { clearDbSessionAction } from "@/actions/auth";
import { signOut, useSession } from "next-auth/react";
import { LogoutIcon } from "../asset/icons";

export default function LogoutButton() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    if (session?.user?.sessionToken) {
      await clearDbSessionAction(session.user.sessionToken);
    }
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="border-t border-slate-100 p-3">
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <LogoutIcon className="h-5 w-5" />
        Keluar
      </button>
    </div>
  );
}
