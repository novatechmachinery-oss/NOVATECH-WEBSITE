import type { Metadata } from "next";
import "./globals.css";
import { getGlobalStructuredData, getRootMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return getRootMetadata();
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = await getGlobalStructuredData();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 font-sans text-slate-950">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
  
