import Link from "next/link";
import Footer from "./Footer";
import SiteHeader from "./SiteHeader";

type ComingSoonPageProps = {
  title: string;
  tag: string;
  description: string;
};

export default function ComingSoonPage({ title, tag, description }: ComingSoonPageProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_36%,#eef2ff_100%)] text-slate-950">
      <SiteHeader />

      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
              <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-amber-200/45 blur-3xl" />

              <div className="relative">
                <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-sky-700">
                  {tag}
                </span>
                <h1 className="mt-6 text-4xl font-black uppercase tracking-[0.05em] text-slate-950 sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  {description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#145b93_0%,#2f80c6_100%)] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_16px_36px_rgba(20,91,147,0.28)] transition hover:-translate-y-0.5"
                  >
                    Back To Home
                  </Link>
                  <Link
                    href="/metal-working-machinery"
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-slate-900 transition hover:border-sky-300 hover:text-sky-700"
                  >
                    View All Machines
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#0f3b63_0%,#165b95_52%,#1f7cc2_100%)] p-8 text-white">
              <div className="absolute -top-10 right-8 h-28 w-28 rounded-full border border-white/20" />
              <div className="absolute bottom-8 left-8 h-20 w-20 rounded-full border border-white/15" />
              <div className="absolute inset-x-10 top-10 h-px bg-white/20" />

              <div className="relative text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/25 bg-white/10 text-3xl font-black shadow-[0_16px_40px_rgba(8,47,73,0.28)]">
                  01
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.28em] text-sky-100">
                  Coming Soon
                </p>
                <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.06em]">
                  New Section In Progress
                </h2>
                <p className="mt-4 max-w-xs text-sm leading-7 text-sky-100">
                  We are preparing this category page with a polished layout and fresh machinery details.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
