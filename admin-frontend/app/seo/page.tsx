"use client";

import { useDeferredValue, useState, useSyncExternalStore } from "react";
import AdminShell from "@/components/layout/admin-shell";
import {
  createSeoPage,
  deleteSeoPage,
  getDefaultSeoWorkspace,
  getMachines,
  getSeoWorkspace,
  subscribeSeoWorkspace,
  updateSeoGlobalSettings,
  updateSeoMachineTemplate,
  updateSeoPage,
} from "@/lib/api";
import type { SeoGlobalSettings, SeoMachineTemplate, SeoPageRecord } from "@/types/seo";

type SeoTab = "pages" | "global" | "templates";
type NoticeTone = "success" | "error" | "info";
type Notice = {
  tone: NoticeTone;
  text: string;
};

type AddPageDraft = {
  path: string;
  pageTitle: string;
};

const sourceLabel: Record<SeoPageRecord["source"], string> = {
  system: "System",
  category: "Category",
  machine: "Machine",
  custom: "Custom",
};

const sourceOrder: Record<SeoPageRecord["source"], number> = {
  system: 0,
  category: 1,
  machine: 2,
  custom: 3,
};

const emptyAddPageDraft: AddPageDraft = {
  path: "/new-page",
  pageTitle: "New Page",
};

export default function SeoPage() {
  const workspace = useSyncExternalStore(subscribeSeoWorkspace, getSeoWorkspace, getDefaultSeoWorkspace);
  const [activeTab, setActiveTab] = useState<SeoTab>("pages");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const [selectedPageId, setSelectedPageId] = useState(workspace.pages[0]?.id ?? "");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPageDraft, setAddPageDraft] = useState<AddPageDraft>(emptyAddPageDraft);
  const [pageNotice, setPageNotice] = useState<Notice | null>(null);

  const filteredPages = workspace.pages
    .filter((page) => {
      const query = deferredSearchValue.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return `${page.pageTitle} ${page.path} ${page.metaTitle}`.toLowerCase().includes(query);
    })
    .sort((first, second) => {
      const sourceGap = sourceOrder[first.source] - sourceOrder[second.source];

      if (sourceGap !== 0) {
        return sourceGap;
      }

      return first.pageTitle.localeCompare(second.pageTitle);
    });

  const activeSelectedPageId = workspace.pages.some((page) => page.id === selectedPageId)
    ? selectedPageId
    : (filteredPages[0]?.id ?? workspace.pages[0]?.id ?? "");
  const selectedPage =
    workspace.pages.find((page) => page.id === activeSelectedPageId) ?? filteredPages[0] ?? workspace.pages[0] ?? null;

  const totalPages = workspace.pages.length;
  const customPages = workspace.pages.filter((page) => page.source === "custom").length;
  const needsAttention = workspace.pages.filter((page) => getSeoScore(page) < 3).length;
  const noIndexPages = workspace.pages.filter((page) => page.noIndex).length;
  const firstMachine = getMachines()[0];

  function handleAddPage() {
    const path = normalizePath(addPageDraft.path);
    const pageTitle = addPageDraft.pageTitle.trim() || "New Page";
    createSeoPage({
      path,
      pageTitle,
    });

    setSelectedPageId(buildLocalSeoId("custom", path));
    setAddPageDraft(emptyAddPageDraft);
    setShowAddModal(false);
    setPageNotice({
      tone: "success",
      text: `${pageTitle} page create ho gayi hai.`,
    });
  }

  return (
    <AdminShell
      title="SEO Management"
      description="Manage page metadata, global defaults and machine-driven templates from one dynamic workspace."
      actions={
        <button className="primary-button" onClick={() => setShowAddModal(true)} type="button">
          + Add Page
        </button>
      }
    >
      <section className="seo-hero">
        <div className="seo-hero-copy">
          <span className="seo-kicker">Search Visibility Workspace</span>
          <h2>Catalogue-driven SEO ko admin panel ke andar proper control mil gaya.</h2>
          <p>
            Static pages, categories aur machines sab ek hi screen par aa rahe hain. Dynamic data
            change hone par base page inventory automatically refresh hoti rahegi, aur custom pages
            separately persist honge.
          </p>
        </div>

        <div className="seo-stat-grid">
          <StatCard label="Tracked Pages" value={String(totalPages)} meta="System + dynamic + custom" />
          <StatCard label="Custom Pages" value={String(customPages)} meta="Manually added routes" />
          <StatCard label="Needs Attention" value={String(needsAttention)} meta="Title or desc weak/missing" />
          <StatCard label="No Index" value={String(noIndexPages)} meta="Excluded from crawling" />
        </div>
      </section>

      <section className="seo-tab-row" aria-label="SEO sections">
        <button
          className={activeTab === "pages" ? "seo-tab-button active" : "seo-tab-button"}
          onClick={() => setActiveTab("pages")}
          type="button"
        >
          Page SEO
        </button>
        <button
          className={activeTab === "global" ? "seo-tab-button active" : "seo-tab-button"}
          onClick={() => setActiveTab("global")}
          type="button"
        >
          Global Settings
        </button>
        <button
          className={activeTab === "templates" ? "seo-tab-button active" : "seo-tab-button"}
          onClick={() => setActiveTab("templates")}
          type="button"
        >
          Machine SEO
        </button>
      </section>

      {activeTab === "pages" ? (
        <section className="seo-layout">
          <article className="seo-list-panel">
            <div className="seo-panel-head">
              <div>
                <h3>Page Inventory</h3>
                <p>Website ke live sections aur admin-added pages ka unified list.</p>
              </div>
              <span className="seo-count-badge">{filteredPages.length}</span>
            </div>

            <label className="seo-search-field">
              <SearchIcon />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by page title or path"
              />
            </label>

            <div className="seo-page-list">
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  className={page.id === selectedPage?.id ? "seo-page-item active" : "seo-page-item"}
                  onClick={() => setSelectedPageId(page.id)}
                  type="button"
                >
                  <div className="seo-page-item-top">
                    <strong>{page.pageTitle}</strong>
                    <span className={`seo-source-pill ${page.source}`}>{sourceLabel[page.source]}</span>
                  </div>
                  <span className="seo-page-path">{page.path}</span>
                  <div className="seo-page-item-meta">
                    <span>{getSeoScoreLabel(page)}</span>
                    <span>{page.noIndex ? "No index" : "Index"}</span>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="seo-editor-panel">
            {selectedPage ? (
              <PageEditor
                key={selectedPage.id}
                defaultDescription={workspace.global.defaultMetaDescription}
                notice={pageNotice}
                page={selectedPage}
                siteUrl={workspace.global.siteUrl}
                onDelete={(page) => {
                  deleteSeoPage(page.id);
                  setSelectedPageId("");
                  setPageNotice({
                    tone: "success",
                    text: "Custom page remove ho gayi hai.",
                  });
                }}
                onSave={(page) => {
                  const nextPath = normalizePath(page.path);
                  const nextId = page.lockedPath ? page.id : buildLocalSeoId(page.source, nextPath);

                  updateSeoPage(page.id, {
                    ...page,
                    path: nextPath,
                  });
                  setSelectedPageId(nextId);
                  setPageNotice({
                    tone: "success",
                    text: "SEO metadata save ho gayi hai.",
                  });
                }}
              />
            ) : (
              <div className="empty-state">No page available for editing.</div>
            )}
          </article>
        </section>
      ) : null}

      {activeTab === "global" ? (
        <GlobalEditor key={workspace.global.siteUrl + workspace.global.titleSuffix} settings={workspace.global} />
      ) : null}

      {activeTab === "templates" ? (
        <TemplateEditor
          key={
            workspace.machineTemplate.machineTitleTemplate +
            workspace.machineTemplate.categoryTitleTemplate +
            workspace.global.titleSuffix
          }
          machine={firstMachine}
          settings={workspace.machineTemplate}
          titleSuffix={workspace.global.titleSuffix}
        />
      ) : null}

      {showAddModal ? (
        <div className="dialog-backdrop">
          <div className="dialog-card seo-add-page-card">
            <div className="dialog-head">
              <div>
                <h3>Add New Page</h3>
                <p>Custom landing page ya manually managed route ke liye SEO record create kijiye.</p>
              </div>
              <button
                className="icon-button modal-close-button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add page modal"
                title="Close"
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="category-popup-form">
              <label className="settings-field">
                <span>Page Path</span>
                <input
                  value={addPageDraft.path}
                  onChange={(event) =>
                    setAddPageDraft((current) => ({ ...current, path: event.target.value }))
                  }
                  placeholder="/new-page"
                />
              </label>

              <label className="settings-field">
                <span>Page Title</span>
                <input
                  value={addPageDraft.pageTitle}
                  onChange={(event) =>
                    setAddPageDraft((current) => ({ ...current, pageTitle: event.target.value }))
                  }
                  placeholder="New Page"
                />
              </label>

              <div className="category-popup-actions">
                <button className="secondary-button" onClick={() => setShowAddModal(false)} type="button">
                  Cancel
                </button>
                <button className="primary-button" onClick={handleAddPage} type="button">
                  Add Page
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

function PageEditor({
  page,
  siteUrl,
  defaultDescription,
  notice,
  onSave,
  onDelete,
}: {
  page: SeoPageRecord;
  siteUrl: string;
  defaultDescription: string;
  notice: Notice | null;
  onSave: (page: SeoPageRecord) => void;
  onDelete: (page: SeoPageRecord) => void;
}) {
  const [draft, setDraft] = useState(page);

  return (
    <>
      <div className="seo-panel-head">
        <div>
          <h3>Page Metadata Editor</h3>
          <p>Selected page ke title, description aur crawling behavior ko manage kijiye.</p>
        </div>
        <span className="seo-updated-text">
          {draft.updatedAt ? `Updated ${formatDate(draft.updatedAt)}` : "Not saved yet"}
        </span>
      </div>

      <div className="seo-editor-grid">
        <label className="settings-field">
          <span>Page Title</span>
          <input
            value={draft.pageTitle}
            onChange={(event) => setDraft((current) => ({ ...current, pageTitle: event.target.value }))}
            placeholder="About Us"
          />
        </label>

        <label className="settings-field">
          <span>Page Path</span>
          <input
            value={draft.path}
            disabled={draft.lockedPath}
            onChange={(event) => setDraft((current) => ({ ...current, path: event.target.value }))}
            placeholder="/about"
          />
          <small>{draft.lockedPath ? "Dynamic route path locked hai." : "Custom route editable hai."}</small>
        </label>

        <label className="settings-field seo-field-full">
          <span>Meta Title</span>
          <input
            value={draft.metaTitle}
            onChange={(event) => setDraft((current) => ({ ...current, metaTitle: event.target.value }))}
            placeholder="About Us | Novatech Machinery"
          />
        </label>

        <label className="settings-field seo-field-full">
          <span>Meta Description</span>
          <textarea
            rows={4}
            value={draft.metaDescription}
            onChange={(event) =>
              setDraft((current) => ({ ...current, metaDescription: event.target.value }))
            }
            placeholder="Write a concise search description for this page."
          />
        </label>

        <label className="settings-field seo-field-full">
          <span>Keywords</span>
          <input
            value={draft.keywords}
            onChange={(event) => setDraft((current) => ({ ...current, keywords: event.target.value }))}
            placeholder="used machinery, cnc machines, novatech"
          />
        </label>

        <label className="settings-field">
          <span>Canonical URL</span>
          <input
            value={draft.canonicalUrl}
            onChange={(event) => setDraft((current) => ({ ...current, canonicalUrl: event.target.value }))}
            placeholder="/about"
          />
        </label>

        <label className="settings-field">
          <span>Open Graph Title</span>
          <input
            value={draft.ogTitle}
            onChange={(event) => setDraft((current) => ({ ...current, ogTitle: event.target.value }))}
            placeholder="Share title"
          />
        </label>

        <label className="settings-field seo-field-full">
          <span>Open Graph Description</span>
          <textarea
            rows={3}
            value={draft.ogDescription}
            onChange={(event) =>
              setDraft((current) => ({ ...current, ogDescription: event.target.value }))
            }
            placeholder="Write a social preview description."
          />
        </label>
      </div>

      <div className="seo-toggle-row">
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={!draft.noIndex}
            onChange={(event) => setDraft((current) => ({ ...current, noIndex: !event.target.checked }))}
          />
          <span className="settings-toggle-ui" aria-hidden="true" />
          <span>Allow indexing</span>
        </label>

        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={!draft.noFollow}
            onChange={(event) => setDraft((current) => ({ ...current, noFollow: !event.target.checked }))}
          />
          <span className="settings-toggle-ui" aria-hidden="true" />
          <span>Allow link following</span>
        </label>
      </div>

      <div className="seo-preview-card">
        <span className="seo-preview-label">Search Preview</span>
        <strong>{draft.metaTitle || draft.pageTitle || "Untitled page"}</strong>
        <span className="seo-preview-url">
          {siteUrl}
          {normalizePath(draft.path)}
        </span>
        <p>{draft.metaDescription || defaultDescription}</p>
      </div>

      <div className="settings-actions">
        <button className="primary-button" onClick={() => onSave(draft)} type="button">
          Save SEO Page
        </button>
        {draft.source === "custom" ? (
          <button className="danger-button" onClick={() => onDelete(draft)} type="button">
            Delete Page
          </button>
        ) : null}
        <NoticeText notice={notice} />
      </div>
    </>
  );
}

function GlobalEditor({ settings }: { settings: SeoGlobalSettings }) {
  const [draft, setDraft] = useState(settings);
  const [notice, setNotice] = useState<Notice | null>(null);

  return (
    <section className="seo-form-panel">
      <div className="seo-panel-head">
        <div>
          <h3>Global SEO Defaults</h3>
          <p>Site-wide fallback content jo empty pages par apply ho sakta hai.</p>
        </div>
      </div>

      <div className="seo-editor-grid">
        <label className="settings-field">
          <span>Site Name</span>
          <input value={draft.siteName} onChange={(event) => setDraft((current) => ({ ...current, siteName: event.target.value }))} />
        </label>

        <label className="settings-field">
          <span>Site URL</span>
          <input
            value={draft.siteUrl}
            onChange={(event) => setDraft((current) => ({ ...current, siteUrl: event.target.value }))}
            placeholder="https://novatechmachinery.com"
          />
        </label>

        <label className="settings-field">
          <span>Title Suffix</span>
          <input
            value={draft.titleSuffix}
            onChange={(event) => setDraft((current) => ({ ...current, titleSuffix: event.target.value }))}
            placeholder="| Novatech Machinery"
          />
        </label>

        <label className="settings-field">
          <span>Default Open Graph Image</span>
          <input
            value={draft.defaultOgImage}
            onChange={(event) => setDraft((current) => ({ ...current, defaultOgImage: event.target.value }))}
            placeholder="/images/seo/default-og.jpg"
          />
        </label>

        <label className="settings-field seo-field-full">
          <span>Default Meta Description</span>
          <textarea
            rows={4}
            value={draft.defaultMetaDescription}
            onChange={(event) =>
              setDraft((current) => ({ ...current, defaultMetaDescription: event.target.value }))
            }
          />
        </label>

        <label className="settings-field seo-field-full">
          <span>Default Keywords</span>
          <input
            value={draft.defaultKeywords}
            onChange={(event) => setDraft((current) => ({ ...current, defaultKeywords: event.target.value }))}
            placeholder="used machinery, industrial machines, novatech"
          />
        </label>

        <label className="settings-field">
          <span>Twitter Handle</span>
          <input
            value={draft.twitterHandle}
            onChange={(event) => setDraft((current) => ({ ...current, twitterHandle: event.target.value }))}
            placeholder="@novatechmachinery"
          />
        </label>
      </div>

      <div className="settings-actions">
        <button
          className="primary-button"
          onClick={() => {
            updateSeoGlobalSettings(draft);
            setNotice({
              tone: "success",
              text: "Global SEO defaults update ho gaye hain.",
            });
          }}
          type="button"
        >
          Save Global Settings
        </button>
        <NoticeText notice={notice} />
      </div>
    </section>
  );
}

function TemplateEditor({
  settings,
  machine,
  titleSuffix,
}: {
  settings: SeoMachineTemplate;
  machine: ReturnType<typeof getMachines>[number] | undefined;
  titleSuffix: string;
}) {
  const [draft, setDraft] = useState(settings);
  const [notice, setNotice] = useState<Notice | null>(null);

  return (
    <section className="seo-form-panel">
      <div className="seo-panel-head">
        <div>
          <h3>Machine SEO Templates</h3>
          <p>Dynamic catalogue pages ke liye reusable title aur description patterns.</p>
        </div>
      </div>

      <div className="seo-editor-grid">
        <label className="settings-field seo-field-full">
          <span>Machine Title Template</span>
          <input
            value={draft.machineTitleTemplate}
            onChange={(event) => setDraft((current) => ({ ...current, machineTitleTemplate: event.target.value }))}
            placeholder="{machineName} {brand} {model} {titleSuffix}"
          />
        </label>

        <label className="settings-field seo-field-full">
          <span>Machine Description Template</span>
          <textarea
            rows={4}
            value={draft.machineDescriptionTemplate}
            onChange={(event) =>
              setDraft((current) => ({ ...current, machineDescriptionTemplate: event.target.value }))
            }
            placeholder="Use placeholders like {machineName}, {brand}, {category}, {condition}"
          />
        </label>

        <label className="settings-field seo-field-full">
          <span>Category Title Template</span>
          <input
            value={draft.categoryTitleTemplate}
            onChange={(event) => setDraft((current) => ({ ...current, categoryTitleTemplate: event.target.value }))}
            placeholder="{categoryName} Machines {titleSuffix}"
          />
        </label>

        <label className="settings-field seo-field-full">
          <span>Category Description Template</span>
          <textarea
            rows={4}
            value={draft.categoryDescriptionTemplate}
            onChange={(event) =>
              setDraft((current) => ({ ...current, categoryDescriptionTemplate: event.target.value }))
            }
            placeholder="Use {categoryName} for dynamic output"
          />
        </label>
      </div>

      <div className="seo-template-preview">
        <div className="seo-preview-card">
          <span className="seo-preview-label">Machine Preview</span>
          <strong>
            {fillTemplate(draft.machineTitleTemplate, {
              machineName: machine?.name ?? "Heavy Duty CNC Lathe",
              brand: machine?.brand ?? "Doosan",
              model: machine?.model ?? "Puma GT 2600",
              titleSuffix,
            })}
          </strong>
          <p>
            {fillTemplate(draft.machineDescriptionTemplate, {
              machineName: machine?.name ?? "Heavy Duty CNC Lathe",
              brand: machine?.brand ?? "Doosan",
              category: machine?.category ?? "Metal Working Machinery",
              condition: machine?.condition ?? "Used",
            })}
          </p>
        </div>

        <div className="seo-preview-card">
          <span className="seo-preview-label">Category Preview</span>
          <strong>
            {fillTemplate(draft.categoryTitleTemplate, {
              categoryName: machine?.category ?? "Metal Working Machinery",
              titleSuffix,
            })}
          </strong>
          <p>
            {fillTemplate(draft.categoryDescriptionTemplate, {
              categoryName: machine?.category ?? "Metal Working Machinery",
            })}
          </p>
        </div>
      </div>

      <div className="settings-actions">
        <button
          className="primary-button"
          onClick={() => {
            updateSeoMachineTemplate(draft);
            setNotice({
              tone: "success",
              text: "Machine SEO templates save ho gaye hain.",
            });
          }}
          type="button"
        >
          Save Machine SEO
        </button>
        <NoticeText notice={notice} />
      </div>
    </section>
  );
}

function StatCard({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="seo-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </div>
  );
}

function NoticeText({ notice }: { notice: Notice | null }) {
  if (!notice) {
    return null;
  }

  return <p className={`settings-notice ${notice.tone}`}>{notice.text}</p>;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m21 21-4.2-4.2M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function buildLocalSeoId(source: SeoPageRecord["source"], path: string) {
  return `${source}:${normalizePath(path)}`;
}

function normalizePath(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "/";
  }

  return trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`;
}

function getSeoScore(page: SeoPageRecord) {
  const checks = [page.metaTitle.trim(), page.metaDescription.trim(), page.ogDescription.trim()];
  return checks.filter(Boolean).length;
}

function getSeoScoreLabel(page: SeoPageRecord) {
  const score = getSeoScore(page);

  if (score === 3) {
    return "Strong";
  }

  if (score === 2) {
    return "Okay";
  }

  return "Needs work";
}

function fillTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (content, [key, value]) => content.replaceAll(`{${key}}`, value),
    template,
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
