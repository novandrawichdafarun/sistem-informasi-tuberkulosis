export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="h-8 w-1/3 rounded-full bg-slate-200 animate-pulse" />
          <div className="mt-3 h-4 w-1/2 rounded-full bg-slate-200 animate-pulse" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="h-6 w-40 rounded-full bg-slate-200 animate-pulse" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-full rounded-full bg-slate-200 animate-pulse" />
              <div className="h-4 w-5/6 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-4 w-2/3 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="h-6 w-40 rounded-full bg-slate-200 animate-pulse" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-full rounded-full bg-slate-200 animate-pulse" />
              <div className="h-4 w-5/6 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-4 w-2/3 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="h-6 w-40 rounded-full bg-slate-200 animate-pulse" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-full rounded-full bg-slate-200 animate-pulse" />
              <div className="h-4 w-5/6 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-4 w-2/3 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white p-6 shadow-sm"
              aria-busy="true"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-slate-200 animate-pulse" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="h-4 w-full rounded-full bg-slate-200 animate-pulse" />
                <div className="h-4 w-5/6 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-4 w-2/3 rounded-full bg-slate-200 animate-pulse" />
              </div>
              <div className="mt-6 flex gap-3">
                <div className="h-10 w-24 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-10 w-24 rounded-full bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
