export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div
        className="h-9 w-48 rounded-xl mb-8 animate-pulse"
        style={{ backgroundColor: "var(--bg2)" }}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl aspect-square animate-pulse"
            style={{ backgroundColor: "var(--bg2)" }}
          />
        ))}
      </div>
    </div>
  );
}
