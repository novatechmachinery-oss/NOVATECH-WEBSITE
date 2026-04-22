import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Metal Working Machinery", href: "/metal-working-machinery" },
  { label: "Used Machinery", href: "/used-machinery" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const machineryLinks = [
  { label: "Conventional Machines", href: "/metal-working-machinery#conventional-machines" },
  { label: "CNC Machines", href: "/metal-working-machinery#cnc-machines" },
  { label: "Horizontal Boring", href: "/metal-working-machinery#all-machines" },
  { label: "Vertical Turret Lathes", href: "/metal-working-machinery#all-machines" },
  { label: "Forging Presses", href: "/metal-working-machinery#all-machines" },
  { label: "Grinding Machines", href: "/metal-working-machinery#all-machines" },
  { label: "Gear Hobbing", href: "/metal-working-machinery#all-machines" },
];

export default function Footer() {
  return (
    <footer className="overflow-hidden bg-[#234b74] text-white">
      <div className="mx-auto max-w-[1660px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/30 bg-white/95 sm:h-12 sm:w-12">
                <Image src="/images/main-logo.svg" alt="Novatech logo" fill className="object-contain p-2" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-bold leading-none uppercase tracking-[0.08em] text-white sm:text-[1.8rem]">
                  Novatech
                </h2>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white sm:text-sm sm:tracking-[0.18em]">
                  Machinery Corporation
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/90 sm:text-[15px] sm:leading-7">
              Novatech Machinery Corporation (OPC) Private Limited. Trusted partner for quality
              industrial machinery, global sourcing, and dependable support for every production need.
            </p>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-white sm:text-sm">
              <span>Global Sourcing</span>
              <span>50+ Machine Types</span>
            </div>

            <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex min-w-0 flex-col gap-0.5 text-sm font-medium leading-5 md:flex-row md:flex-wrap md:items-center md:gap-2">
                  <a href="tel:+919646255755" className="whitespace-nowrap transition hover:opacity-80">
                    +91 9646255755
                  </a>
                  <span className="hidden text-white/50 md:inline">|</span>
                  <a href="tel:+919646255855" className="whitespace-nowrap transition hover:opacity-80">
                    +91 9646255855
                  </a>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-2">
                <Mail className="mt-0.5 h-5 w-5 shrink-0" />
                <a
                  href="mailto:info@novatechmachinery.com"
                  className="min-w-0 text-sm font-medium leading-5 transition hover:opacity-80 md:whitespace-nowrap"
                >
                  info@novatechmachinery.com
                </a>
              </div>

              <div className="flex items-start justify-between gap-3 md:col-span-2 xl:col-span-1">
                <div className="flex min-w-0 items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium leading-5">
                    Sector 70,
                    <br />
                    Mohali
                  </span>
                </div>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Jubilee+Walk+Sector+70+Mohali"
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#234b74]"
                >
                  View
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-5 sm:gap-8">
              <div>
                <h3 className="border-b border-white/20 pb-2 text-base font-bold uppercase tracking-[0.12em] text-white sm:text-lg">
                  Machinery
                </h3>

                <div className="mt-3 space-y-1.5 text-[13px] sm:text-[15px]">
                  {machineryLinks.map((item) => {
                    const uniqueKey = item.label.replace(/\s+/g, "-").toLowerCase();
                    return (
                      <Link
                        key={uniqueKey}
                        href={item.href}
                        className="block leading-6 text-white transition hover:opacity-80"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="border-b border-white/20 pb-2 text-base font-bold uppercase tracking-[0.12em] text-white sm:text-lg">
                  Quick Links
                </h3>

                <div className="mt-3 space-y-1.5 text-[13px] sm:text-[15px]">
                  {quickLinks.map((item) => (
                    <Link
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      className="block leading-6 text-white transition hover:opacity-80"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1660px] flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-white sm:px-6 sm:text-sm md:flex-row lg:px-8">
          <p className="text-center md:text-left">
            Copyright {new Date().getFullYear()} Novatech Digisoft. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 font-medium sm:gap-6">
            <Link href="/privacy-policy" className="transition hover:opacity-80">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="transition hover:opacity-80">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
