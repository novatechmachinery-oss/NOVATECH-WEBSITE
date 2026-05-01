import Link from "next/link";
import { Bolt, Cog, Drill, Factory, Gauge, Hammer, Layers3, ScanLine, Shield, Wrench } from "lucide-react";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { getMachineCatalogData } from "@/lib/machines";

const iconMap = {
  "Bending Machines": Wrench,
  "CNC Machines": Bolt,
  "Drilling Machinery": Drill,
  "Forging & Foundry Machinery": Hammer,
  "Gear Machinery": Cog,
  Grinders: Gauge,
  "Horizontal Boring Mills": Drill,
  "Laser Cutting Machines": ScanLine,
  "Lathes & Turning Machines": Wrench,
  "Machining Centres": Wrench,
  "Milling Machines": Factory,
  Presses: Hammer,
  "Sheet Metal Machinery": Shield,
  "Thread Milling": Wrench,
  "Vertical Turning Lathes": Layers3,
} as const;

function getCategoryHref(categoryName: string) {
  return {
    pathname: "/used-machinery",
    query: { category: categoryName },
  };
}

export default async function CategoriesPage() {
  const { machineCategories } = await getMachineCatalogData();
  const activeCategories = machineCategories
    .filter((category) => category.count > 0)
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .map((category) => ({
      name: category.name,
      href: getCategoryHref(category.name),
      subcategories: category.sub ?? [],
      count: category.count,
      countLabel: `${category.count} machine${category.count === 1 ? "" : "s"}`,
      Icon: iconMap[category.name as keyof typeof iconMap] ?? Factory,
    }));

  const featuredNames = new Set(activeCategories.map((category) => category.name));
  const remainingCategories = machineCategories
    .filter((category) => !featuredNames.has(category.name))
    .map((category) => ({
      name: category.name,
      href: getCategoryHref(category.name),
    }));

  const totalMachines = activeCategories.reduce((sum, category) => sum + category.count, 0);
  const totalSubcategories = activeCategories.reduce(
    (sum, category) => sum + category.subcategories.length,
    0,
  );
  const featuredCategories = activeCategories.slice(0, 3);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_38%,#f8fafc_100%)] text-slate-950">
      <SiteHeader />

      <main className="px-4 py-5 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[1620px]">
          <div className="overflow-hidden rounded-[1.75rem] border border-sky-100/80 bg-white shadow-[0_24px_56px_rgba(15,23,42,0.07)]">
            <div className="relative border-b border-sky-100 bg-[linear-gradient(135deg,#083b5c_0%,#0b5d93_45%,#1482c5_100%)] px-5 py-5 text-white sm:px-7 lg:px-9 lg:py-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_24%)]" />
              <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-sky-200/15 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-cyan-200/10 blur-3xl" />
              <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
                <div>
                  <p className="inline-flex rounded-full border border-white/18 bg-white/10 px-3.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.22em] text-white">
                    Browse by Category
                  </p>
                  <h1 className="mt-2.5 max-w-4xl text-[1.7rem] font-black tracking-tight text-white sm:text-[2.05rem] lg:text-[2.45rem]">
                    Explore Machine Categories
                  </h1>
                  <p className="mt-2.5 max-w-3xl text-[0.92rem] leading-6 text-sky-50 sm:text-[0.97rem]">
                    Jump straight into live industrial categories from the database and find the
                    machine groups that match your exact production needs.
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-[1.1rem] border border-white/14 bg-white/10 px-3.5 py-2.5 backdrop-blur">
                    <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-sky-100/80">
                      Categories
                    </p>
                    <p className="mt-1 text-[1.28rem] font-black leading-none text-white">
                      {activeCategories.length}
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/14 bg-white/10 px-3.5 py-2.5 backdrop-blur">
                    <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-sky-100/80">
                      Machines
                    </p>
                    <p className="mt-1 text-[1.28rem] font-black leading-none text-white">
                      {totalMachines}
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/14 bg-white/10 px-3.5 py-2.5 backdrop-blur">
                    <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-sky-100/80">
                      Subgroups
                    </p>
                    <p className="mt-1 text-[1.28rem] font-black leading-none text-white">
                      {totalSubcategories}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {featuredCategories.length > 0 ? (
              <div className="border-b border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-5 py-4 sm:px-7 lg:px-9">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[0.74rem] font-black uppercase tracking-[0.2em] text-sky-700">
                      Popular Segments
                    </p>
                    <p className="mt-1.5 text-[0.92rem] text-slate-600">
                      Quick access to the busiest machine groups in the current inventory.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {featuredCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-[0.84rem] font-semibold text-sky-800 shadow-[0_8px_20px_rgba(14,116,144,0.08)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
                      >
                        <category.Icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="px-5 py-4 sm:px-7 lg:px-9 lg:py-5">
              <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
              {activeCategories.map((category) => {
                const hiddenCount = Math.max(category.subcategories.length - 4, 0);

                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="group block cursor-pointer overflow-hidden rounded-[1.1rem] border border-sky-100 bg-white shadow-[0_16px_34px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_26px_48px_rgba(20,91,147,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
                  >
                    <div className="relative overflow-hidden border-b border-sky-200 bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] px-4.5 pb-3.5 pt-3.5 text-white">
                      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/15 blur-2xl transition duration-300 group-hover:scale-110" />
                      <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-cyan-100/15 blur-2xl transition duration-300 group-hover:scale-110" />
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                            <category.Icon className="h-4.5 w-4.5" />
                          </span>
                          <h2 className="pr-2 text-[1.12rem] font-bold leading-6 text-white sm:text-[1.2rem]">
                            {category.name}
                          </h2>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#145b93] shadow-[0_8px_20px_rgba(15,23,42,0.16)]">
                          {category.countLabel}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-4.5 pb-4 pt-3">
                      <div className="rounded-[0.9rem] border border-sky-100/80 bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                        <div className="flex flex-wrap gap-2.5">
                          {category.subcategories.slice(0, 4).map((subcategory) => (
                            <span
                              key={subcategory}
                              className="rounded-full bg-sky-50 px-3 py-1.5 text-[0.76rem] font-medium text-slate-700 ring-1 ring-sky-100"
                            >
                              {subcategory}
                            </span>
                          ))}
                          {hiddenCount > 0 ? (
                            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[0.76rem] font-semibold text-white">
                              +{hiddenCount} more
                            </span>
                          ) : null}
                          {category.subcategories.length === 0 ? (
                            <span className="rounded-full bg-sky-50 px-3 py-1.5 text-[0.76rem] text-slate-500 ring-1 ring-sky-100">
                              Explore available machines
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              </div>

              {activeCategories.length === 0 ? (
                <div className="mt-8 rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-600">
                  No machine categories are available in the database yet.
                </div>
              ) : null}

              <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f9fbfd_100%)] p-4.5 sm:p-5">
                <p className="text-[0.82rem] font-black uppercase tracking-[0.18em] text-slate-500">
                  Other Categories
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {remainingCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[0.82rem] font-medium text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                    >
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
                {remainingCategories.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No additional categories found.</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
