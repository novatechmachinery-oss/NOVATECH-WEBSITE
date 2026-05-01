export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
};

export type HomeFeature = {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imagePosition?: string;
  ctaLabel?: string;
};

export type NavCategoryLink = {
  id: string;
  label: string;
  href: string;
};

export type QuickLink = {
  id: string;
  label: string;
  href: string;
};

export type SiteSettings = {
  companyName: string;
  companyTagline: string;
  adminEmail: string;
  adminProfile: {
    fullName: string;
    phone: string;
  };
  home: {
    heroSlides: HeroSlide[];
    featureCards: HomeFeature[];
    sectionTitle: string;
    machineCtaTitle: string;
    machineCtaDescription: string;
  };
  navigation: {
    categoryLinks: NavCategoryLink[];
  };
  contact: {
    phonePrimary: string;
    phoneSecondary: string;
    whatsappNumber: string;
    emailAddress: string;
    mapLocation: string;
    officeAddress: string;
    businessHours: string;
  };
  footer: {
    aboutText: string;
    quickLinks: QuickLink[];
    machineryLinks: QuickLink[];
    copyrightText: string;
    policyLinks: QuickLink[];
  };
  operations: {
    smtp: {
      host: string;
      port: string;
      username: string;
      password: string;
      fromEmail: string;
      fromName: string;
      secure: boolean;
      testEmail: string;
    };
    analytics: {
      googleAnalyticsId: string;
      metaPixelId: string;
      clarityProjectId: string;
    };
  };
};
