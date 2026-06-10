export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="flex flex-col gap-4">
            {[120, 180, 100, 80, 140].map((w, i) => (
              <div key={i} className="h-8 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg2)", width: w }} />
            ))}
          </div>
        </aside>
        {/* Grid skeleton */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden animate-pulse" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
              <div className="aspect-[4/3]" style={{ backgroundColor: "var(--bg2)" }} />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 rounded-lg" style={{ backgroundColor: "var(--bg2)", width: "70%" }} />
                <div className="h-3 rounded-lg" style={{ backgroundColor: "var(--bg2)", width: "40%" }} />
                <div className="h-6 rounded-lg mt-1" style={{ backgroundColor: "var(--bg2)", width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
