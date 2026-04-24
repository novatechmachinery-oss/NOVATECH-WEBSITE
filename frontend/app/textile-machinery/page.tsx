import Link from "next/link";
import Footer from "../../components/Footer";
import SiteHeader from "../../components/SiteHeader";
import MachineCard from "../../components/Cards/MachineCard";

export default function TextileMachineryPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Textile Machinery</p>
          <h1 className="mb-6 text-5xl font-black uppercase tracking-[0.08em] text-slate-900 sm:text-6xl lg:text-7xl">
            COMING SOON
          </h1>
          <p className="mt-4 text-lg text-slate-600 sm:text-xl">
            Our Textile Machinery section is under construction.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-8 py-4 text-lg font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--accent)]"
            >
              Contact Us For Updates
            </Link>
          </div>
        </div>
      </main>
      <MachineCard
        title="Looking for a Specific Machine?"
        description="Tell us what you need and we'll find the right machine at the best price."
      />
      <Footer />
    </div>
  );
}
