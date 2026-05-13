"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-black text-slate-900">Something went wrong</h1>
          <p className="mt-3 text-slate-600">
            We could not load this page right now. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full bg-[#145b93] px-6 py-3 text-sm font-semibold text-white hover:bg-[#10486f]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

