import { Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";

export const contactDetails = {
  phonePrimary: "+91 96462 55755",
  phoneSecondary: "+91 96462 55855",
  whatsappNumber: "+91 96462 55755",
  emailAddress: "info@novatechmachinery.com",
  mapLocation: "Jubilee Walk, Sector 70, Mohali",
  officeAddress: "6th Floor, Office No. 621, Jubilee Walk, Sector 70, Mohali",
  businessHours: "Mon-Sat, 9 AM - 6 PM IST",
} as const;

const mapsQuery = encodeURIComponent(contactDetails.mapLocation);

export const contactLinks = {
  mapsEmbedUrl: `https://maps.google.com/maps?q=${mapsQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`,
  mapsOpenUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
  whatsappLink: "https://wa.me/919646255755",
  primaryCallLink: "tel:+919646255755",
  emailLink: `mailto:${contactDetails.emailAddress}`,
} as const;

export type ContactCard = {
  icon: LucideIcon;
  label: string;
  title: string;
  detail: string;
  href: string;
};

export const contactCards: ContactCard[] = [
  {
    icon: Phone,
    label: "Call Us",
    title: `${contactDetails.phonePrimary} / ${contactDetails.phoneSecondary}`,
    detail: contactDetails.businessHours,
    href: contactLinks.primaryCallLink,
  },
  {
    icon: Mail,
    label: "Email Us",
    title: contactDetails.emailAddress,
    detail: "We reply within 24 hours.",
    href: contactLinks.emailLink,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    title: contactDetails.whatsappNumber,
    detail: "Fast responses during business hours.",
    href: contactLinks.whatsappLink,
  },
  {
    icon: MapPin,
    label: "Visit Us",
    title: contactDetails.officeAddress,
    detail: "Visits by appointment only.",
    href: contactLinks.mapsOpenUrl,
  },
];
