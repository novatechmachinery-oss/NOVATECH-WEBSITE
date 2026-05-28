export const WHATSAPP_NUMBER = "+91 96462 55755";
export const REQUEST_PRICE_WHATSAPP_NUMBER = "+91 96462 55855";

export function getWhatsAppHref(phoneNumber: string) {
  return `https://wa.me/${phoneNumber.replace(/\D/g, "")}`;
}

export const WHATSAPP_HREF = getWhatsAppHref(WHATSAPP_NUMBER);
export const REQUEST_PRICE_WHATSAPP_HREF = getWhatsAppHref(REQUEST_PRICE_WHATSAPP_NUMBER);
