import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import AnalyticsPageView from "@/components/seo/AnalyticsPageView";
import { getSeoConfig } from "@/lib/seo/seo-config";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getGlobalSchemas } from "@/lib/seo/schema";
import { getTrackingConfig } from "@/lib/seo/tracking";
import MachineSearchAgent from "@/components/MachineSearchAgent";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [seoConfig, metadata] = await Promise.all([
    getSeoConfig(),
    generatePageMetadata("/", { canonicalRoute: "/" }),
  ]);

  return {
    ...metadata,
    metadataBase: new URL(seoConfig.baseUrl),
    applicationName: seoConfig.siteName,
    authors: [{ name: seoConfig.siteName, url: seoConfig.baseUrl }],
    creator: seoConfig.siteName,
    publisher: seoConfig.siteName,
    category: "Industrial machinery",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
        { url: "/main-logo.png", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/main-logo.png",
    },
    manifest: "/manifest.webmanifest",
    verification: {
      google:
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
        process.env.NEXT_PUBLIC_GSC_VERIFICATION ||
        undefined,
      other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : undefined,
    },
  };
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
  const [{ organization, website }, tracking] = await Promise.all([
    getGlobalSchemas(),
    getTrackingConfig(),
  ]);

  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 font-sans text-slate-950">
        {tracking.googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${tracking.googleAnalyticsId}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${tracking.googleAnalyticsId}', { send_page_view: false });`}
            </Script>
            <Suspense fallback={null}>
              <AnalyticsPageView measurementId={tracking.googleAnalyticsId} />
            </Suspense>
          </>
        ) : null}
        {tracking.metaPixelId ? (
          <Script id="meta-pixel" strategy="lazyOnload">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${tracking.metaPixelId}');
fbq('track', 'PageView');`}
          </Script>
        ) : null}
        {tracking.clarityId ? (
          <Script id="microsoft-clarity" strategy="lazyOnload">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${tracking.clarityId}");`}
          </Script>
        ) : null}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organization, website]) }}
        />
        {children}
        <LanguageSwitcher />
        <MachineSearchAgent />
      </body>
    </html>
  );
}
  
