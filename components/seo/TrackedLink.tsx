"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  eventName: "contact_whatsapp" | "contact_phone" | "contact_email";
  eventContext?: string;
};

export default function TrackedLink({ children, eventName, eventContext, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        window.gtag?.("event", eventName, {
          content_type: "machine",
          content_group: eventContext,
        });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
