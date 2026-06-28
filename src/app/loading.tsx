export default function Loading() {
  return (
    <main className="bg-black">
      {/* Hero skeleton */}
      <div className="h-svh animate-pulse bg-white/5" />

      {/* Product carousel skeleton */}
      <div className="mx-auto max-w-[90rem] px-6 py-20 sm:px-10">
        <div className="mb-8 h-3 w-32 animate-pulse bg-white/10 rounded" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[240px]">
              <div className="mb-3 aspect-[3/4] w-full animate-pulse rounded-[1rem] bg-white/5" />
              <div className="mb-2 h-3 w-28 animate-pulse bg-white/10 rounded" />
              <div className="h-3 w-16 animate-pulse bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
