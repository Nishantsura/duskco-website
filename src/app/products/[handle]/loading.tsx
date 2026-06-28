export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8 sm:px-10 sm:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_440px] lg:gap-16">
        <div className="aspect-[3/4] w-full animate-pulse bg-brand-chalk" />
        <div className="flex flex-col gap-6">
          <div className="h-3 w-16 animate-pulse bg-brand-chalk" />
          <div className="h-8 w-48 animate-pulse bg-brand-chalk" />
          <div className="h-5 w-20 animate-pulse bg-brand-chalk" />
          <div className="h-12 w-full animate-pulse bg-brand-chalk" />
          <div className="h-14 w-full animate-pulse bg-brand-black/20" />
        </div>
      </div>
    </main>
  );
}
