export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      {/* Animasi Spinner */}
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Menyiapkan data dashboard...
      </p>
    </div>
  );
}
