import type { ReactNode } from "react";

type HeaderVisibilityProps = {
  children: ReactNode;
};

export default function HeaderVisibility({ children }: HeaderVisibilityProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm shadow-slate-950/5">
      {children}
    </header>
  );
}
