import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Novatech Admin",
  description: "Standalone admin frontend for Novatech machinery management.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 font-sans text-slate-950">{children}</body>
    </html>
  );
}
