export default function CollectionLoading() {
  return (
    <main>
      <div className="flex flex-col items-center justify-center bg-surface py-16 sm:py-24">
        <div className="h-10 w-64 bg-surface" />
      </div>
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="mb-4 aspect-[3/4] w-full bg-surface" />
              <div className="mb-2 h-3 w-16 bg-surface" />
              <div className="mb-1 h-4 w-32 bg-surface" />
              <div className="h-4 w-16 bg-surface" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
