import MachineCard from "../../components/Cards/MachineCard";
import Footer from "../../components/Footer";
import SiteHeader from "../../components/SiteHeader";

const categories = [
  "Metal Working Machinery",
  "Pharmaceutical Machinery",
  "Plastic Machinery",
  "Textile Machinery",
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <main className="px-3 py-8 sm:px-6 sm:py-10 lg:px-10">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-center text-2xl font-extrabold uppercase tracking-[0.08em] text-slate-900 sm:text-3xl">
            Category
          </h1>
          <div className="mx-auto mt-2 h-1 w-12 bg-[var(--accent-soft)]" />

          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 md:flex md:gap-4">
            {categories.map((category) => (
              <article
                key={category}
                className="flex min-h-[88px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-4 text-center shadow-[0_10px_28px_rgba(15,23,42,0.08)] sm:min-h-[108px] sm:p-5 md:flex-1"
              >
                <h2 className="text-sm font-extrabold uppercase leading-6 text-slate-950 sm:text-[0.95rem]">
                  {category}
                </h2>
              </article>
            ))}
          </div>
        </section>
      </main>

      <MachineCard
        title="Looking for a Specific Machine?"
        description="Tell us what you need and we'll find the right machine at the best price."
      />
      <Footer />
    </div>
  );
}
