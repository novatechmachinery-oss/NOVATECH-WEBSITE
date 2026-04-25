import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novatech Admin",
  description: "Admin panel for machine management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
