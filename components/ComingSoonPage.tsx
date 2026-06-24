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
        <section className="mx-auto max-w-5xl">
          <div className="relative px-4 py-10 sm:px-8 lg:px-10 lg:py-14">
            <div className="relative grid min-h-[420px] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="mx-auto flex w-full max-w-[620px] flex-col items-center text-center">
                <p className="text-[0.82rem] font-black uppercase tracking-[0.24em] text-sky-700">
                  {tag}
                </p>
                <h1 className="mt-5 text-[2.2rem] font-black leading-[0.92] tracking-[0.01em] text-slate-950 sm:text-[3rem] lg:text-[4.6rem]">
                  {title}
                </h1>
                <p className="mt-7 text-[1.24rem] font-black uppercase tracking-[0.16em] text-sky-700 sm:text-[1.62rem]">
                  Coming Soon!
                </p>

                <div className="mt-12 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/"
                    className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#145b93_0%,#2f80c6_100%)] px-6 py-3 text-[0.8rem] font-black uppercase tracking-[0.08em] text-white shadow-[0_16px_36px_rgba(20,91,147,0.28)] transition hover:-translate-y-0.5"
                  >
                    Back To Home
                  </Link>
                  <Link
                    href="/metal-working-machinery"
                    className="inline-flex min-w-[208px] items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-[0.8rem] font-black uppercase tracking-[0.08em] text-slate-900 transition hover:border-sky-300 hover:text-sky-700"
                  >
                    View All Machines
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto h-[360px] w-[260px] lg:mr-4">
                <div className="coming-rocket">
                  <div className="coming-rocket-body">
                    <div className="coming-rocket-shell" />
                    <div className="coming-fin coming-fin-left" />
                    <div className="coming-fin coming-fin-right" />
                    <div className="coming-window" />
                  </div>
                  <div className="coming-exhaust-flame" />
                  <ul className="coming-exhaust-fumes" aria-hidden="true">
                    {Array.from({ length: 9 }, (_, index) => (
                      <li key={index} />
                    ))}
                  </ul>
                  <ul className="coming-star" aria-hidden="true">
                    {Array.from({ length: 7 }, (_, index) => (
                      <li key={index} />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
