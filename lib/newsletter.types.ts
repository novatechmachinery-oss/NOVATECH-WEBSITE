export type NewsletterSubscriptionChannel = "email" | "whatsapp";

export type NewsletterSubscriber = {
  id: string;
  contact: string;
  channel: NewsletterSubscriptionChannel;
  status: "active" | "inactive";
  subscribedAt: string;
};

export type NewsletterFormValues = {
  contact: string;
  channel: NewsletterSubscriptionChannel;
};
