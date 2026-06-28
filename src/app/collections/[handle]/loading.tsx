export default function CollectionLoading() {
  return (
    <main>
      <div className="flex flex-col items-center justify-center bg-brand-chalk/30 py-16 sm:py-24">
        <div className="h-10 w-64 animate-pulse bg-brand-chalk" />
      </div>
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="mb-4 aspect-[3/4] w-full animate-pulse bg-brand-chalk" />
              <div className="mb-2 h-3 w-16 animate-pulse bg-brand-chalk" />
              <div className="mb-1 h-4 w-32 animate-pulse bg-brand-chalk" />
              <div className="h-4 w-16 animate-pulse bg-brand-chalk" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
