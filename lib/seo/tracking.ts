import "server-only";

export async function getTrackingConfig() {
  return {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
    clarityId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || "",
  };
}

