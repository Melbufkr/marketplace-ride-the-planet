export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="h-9 w-48 rounded-xl animate-pulse mb-8" style={{ backgroundColor: "var(--bg2)" }} />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-5 animate-pulse" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl shrink-0" style={{ backgroundColor: "var(--bg2)" }} />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 rounded-lg" style={{ backgroundColor: "var(--bg2)", width: "60%" }} />
                <div className="h-3 rounded-lg" style={{ backgroundColor: "var(--bg2)", width: "40%" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
