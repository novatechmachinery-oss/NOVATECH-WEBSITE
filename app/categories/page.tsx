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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeCategories.map((category) => {
                const hiddenCount = Math.max(category.subcategories.length - 4, 0);

                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="group block cursor-pointer overflow-hidden rounded-[1.4rem] border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_18px_38px_rgba(15,23,42,0.08),0_6px_18px_rgba(14,116,144,0.08)] transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_28px_52px_rgba(20,91,147,0.16),0_10px_24px_rgba(14,116,144,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
                  >
                    <div className="relative overflow-hidden border-b border-[#d9b24a] bg-[linear-gradient(135deg,#9b6a06_0%,#c89112_55%,#f0c44d_100%)] px-4.5 pb-3.5 pt-3.5 text-white">
                      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/12 blur-2xl transition duration-300 group-hover:scale-110" />
                      <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-amber-100/20 blur-2xl transition duration-300 group-hover:scale-110" />
                      <div className="relative flex items-start justify-between gap-4">
                        <h2 className="pr-3 text-[1.18rem] font-bold leading-6 text-white sm:text-[1.24rem]">
                          {category.name}
                        </h2>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#8e5d04] shadow-[0_8px_20px_rgba(91,58,8,0.16)]">
                          {category.countLabel}
                        </span>
                      </div>
                    </div>

                    <div className="px-4.5 pb-4 pt-3">
                      <div className="rounded-[1rem] border border-slate-100 bg-white/90 p-3">
                        <div className="flex flex-wrap gap-2.5">
                          {category.subcategories.slice(0, 4).map((subcategory) => (
                            <span
                              key={subcategory}
                              className="rounded-full bg-slate-100 px-3 py-1.5 text-[0.76rem] font-medium text-slate-700"
                            >
                              {subcategory}
                            </span>
                          ))}
                          {hiddenCount > 0 ? (
                            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[0.76rem] font-semibold text-amber-700">
                              +{hiddenCount} more
                            </span>
                          ) : null}
                          {category.subcategories.length === 0 ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[0.76rem] text-slate-500">
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
