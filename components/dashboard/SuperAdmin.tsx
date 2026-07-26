import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Super Admin
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Selamat datang kembali, {session?.user?.email}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"></div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"></div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"></div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"></div>
      </div>
    </div>
  );
}
