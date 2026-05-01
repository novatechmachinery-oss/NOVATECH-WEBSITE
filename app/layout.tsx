import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novatech Machinery",
  description: "Modern industrial machinery marketplace for used equipment and secure sourcing.",
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
  