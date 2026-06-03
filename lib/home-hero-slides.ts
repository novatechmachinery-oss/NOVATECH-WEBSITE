import type { HeroSlide } from "@/lib/site-settings.types";

export const HOME_HERO_IMAGE_NAMES = ["10", "11", "12", "13", "14", "15", "16"] as const;

export const HOME_HERO_SLIDES: HeroSlide[] = HOME_HERO_IMAGE_NAMES.map((imageName) => ({
  id: `hero-${imageName}`,
  src: `/images/${imageName}.png`,
  alt: `Novatech home banner slide ${imageName}`,
}));
