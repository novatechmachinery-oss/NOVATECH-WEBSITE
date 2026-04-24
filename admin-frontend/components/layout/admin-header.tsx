import { ReactNode } from "react";

type AdminHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <>
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="topbar-block">[]</div>
          <span className="topbar-email">admin@novatechmachinery.com</span>
        </div>
        <div className="admin-topbar-right">
          <a href="/" className="topbar-link">
            View Site {"->"}
          </a>
        </div>
      </header>

      <section className="admin-content">
        <div className="page-hero">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {actions ? <div className="page-actions">{actions}</div> : null}
        </div>
      </section>
    </>
  );
}
