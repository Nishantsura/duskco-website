export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-10 sm:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_440px] lg:gap-16">
        <div className="aspect-[3/4] w-full bg-surface" />
        <div className="flex flex-col gap-6">
          <div className="h-3 w-16 bg-surface" />
          <div className="h-8 w-48 bg-surface" />
          <div className="h-5 w-20 bg-surface" />
          <div className="h-12 w-full bg-surface" />
          <div className="h-14 w-full bg-surface" />
        </div>
      </div>
    </main>
  );
}
