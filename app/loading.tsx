export default function Loading() {
  return (
    <div className="min-h-[45vh] bg-slate-50 px-4 py-10 text-slate-700">
      <div className="mx-auto max-w-[1200px]">
        <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[6px] border border-slate-200 bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

