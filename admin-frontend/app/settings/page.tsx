"use client";

import type { ReactNode } from "react";
import { ChangeEvent, FormEvent, useRef, useState, useSyncExternalStore } from "react";
import AdminShell from "@/components/layout/admin-shell";
import {
  buildWorkspaceSnapshot,
  changeAdminPassword,
  getActiveTrackingCount,
  getAdminSettings,
  getDefaultAdminSettings,
  importWorkspaceSnapshot,
  sendTestEmail,
  subscribeAdminSettings,
  updateProfileSettings,
  updateSmtpSettings,
  updateTrackingSettings,
} from "@/lib/api";
import { formatAdminDate } from "@/lib/format";
import type { AdminSettings } from "@/types/settings";

type NoticeTone = "success" | "error" | "info";
type Notice = {
  tone: NoticeTone;
  text: string;
};

export default function SettingsPage() {
  const storedSettings = useSyncExternalStore(
    subscribeAdminSettings,
    getAdminSettings,
    getDefaultAdminSettings,
  );
  const [profileDraft, setProfileDraft] = useState<AdminSettings["profile"] | null>(null);
  const [smtpDraft, setSmtpDraft] = useState<AdminSettings["smtp"] | null>(null);
  const [trackingDraft, setTrackingDraft] = useState<AdminSettings["tracking"] | null>(null);
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileNotice, setProfileNotice] = useState<Notice | null>(null);
  const [smtpNotice, setSmtpNotice] = useState<Notice | null>(null);
  const [trackingNotice, setTrackingNotice] = useState<Notice | null>(null);
  const [backupNotice, setBackupNotice] = useState<Notice | null>(null);
  const [securityNotice, setSecurityNotice] = useState<Notice | null>(null);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const profile = profileDraft ?? storedSettings.profile;
  const smtp = smtpDraft ?? storedSettings.smtp;
  const tracking = trackingDraft ?? storedSettings.tracking;
  const security = storedSettings.security;

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const savedSettings = updateProfileSettings(profile);
    setProfileDraft(savedSettings.profile);
    setProfileNotice({
      tone: "success",
      text: "Profile information save ho gayi hai.",
    });
  }

  function handleSmtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const savedSettings = updateSmtpSettings(smtp);
    setSmtpDraft(savedSettings.smtp);
    setSmtpNotice({
      tone: "success",
      text: "SMTP configuration update ho gayi hai.",
    });
  }

  function handleTrackingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const savedSettings = updateTrackingSettings(tracking);
    setTrackingDraft(savedSettings.tracking);
    setTrackingNotice({
      tone: "success",
      text: "Tracking IDs save ho gayi hain.",
    });
  }

  function handleSendTestEmail() {
    const result = sendTestEmail(testEmail);
    setSmtpNotice({
      tone: result.ok ? "success" : "error",
      text: result.message,
    });
  }

  function handleExportSnapshot() {
    const snapshot = buildWorkspaceSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeDate = new Date().toISOString().slice(0, 10);

    link.href = downloadUrl;
    link.download = `novatech-admin-backup-${safeDate}.json`;
    link.click();
    window.URL.revokeObjectURL(downloadUrl);

    setBackupNotice({
      tone: "success",
      text: "Workspace snapshot export ho gaya hai.",
    });
  }

  function handleImportTrigger() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const rawContent = await file.text();
      const summary = importWorkspaceSnapshot(rawContent);
      setProfileDraft(null);
      setSmtpDraft(null);
      setTrackingDraft(null);
      setBackupNotice({
        tone: "success",
        text: `${summary.machines} machines aur ${summary.categories} categories ke saath snapshot import ho gaya.`,
      });
    } catch (error) {
      setBackupNotice({
        tone: "error",
        text: error instanceof Error ? error.message : "Import file parse nahi ho saki.",
      });
    } finally {
      event.target.value = "";
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.trim().length < 8) {
      setSecurityNotice({
        tone: "error",
        text: "Password kam se kam 8 characters ka rakhiye.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityNotice({
        tone: "error",
        text: "Confirm password match nahi kar raha.",
      });
      return;
    }

    try {
      setIsPasswordSaving(true);
      await changeAdminPassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setSecurityNotice({
        tone: "success",
        text: "Admin password hash safely update ho gaya hai.",
      });
    } catch {
      setSecurityNotice({
        tone: "error",
        text: "Password update nahi ho paaya. Dobara try kijiye.",
      });
    } finally {
      setIsPasswordSaving(false);
    }
  }

  const smtpReady = [smtp.host, smtp.port, smtp.username, smtp.password, smtp.fromEmail, smtp.fromName]
    .every((value) => value.trim().length > 0);
  const trackingCount = getActiveTrackingCount(tracking);
  const profileInitials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <AdminShell
      title="Settings"
      description="Manage admin identity, email delivery, analytics, workspace backup and access control."
    >
      <section className="settings-hero">
        <div className="settings-hero-main">
          <div className="settings-avatar">{profileInitials || "NA"}</div>
          <div className="settings-hero-copy">
            <span className="settings-kicker">Workspace Control</span>
            <h2>{profile.fullName}</h2>
            <p>
              Admin contact, mail routing aur tracking setup ko ek jagah se manage kijiye. Screen ka
              content aapke reference ke same rakha gaya hai, lekin layout ko zyada polished aur
              production-style banaya gaya hai.
            </p>
            <div className="settings-chip-row">
              <span className="settings-chip">{profile.email}</span>
              <span className="settings-chip">{profile.phone}</span>
              <span className={smtpReady ? "settings-chip success" : "settings-chip pending"}>
                {smtpReady ? "SMTP Ready" : "SMTP Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="settings-hero-stats">
          <div className="settings-stat-card">
            <span>Mail Delivery</span>
            <strong>{smtpReady ? "Connected" : "Needs setup"}</strong>
            <small>{smtp.useSsl ? "SSL/TLS enabled" : "TLS/587 workflow"}</small>
          </div>
          <div className="settings-stat-card">
            <span>Tracking Tools</span>
            <strong>{trackingCount}/3 Active</strong>
            <small>GA, Meta Pixel, Clarity</small>
          </div>
          <div className="settings-stat-card">
            <span>Password Status</span>
            <strong>{security.passwordUpdatedAt ? "Updated" : "Pending"}</strong>
            <small>{formatAdminDate(security.passwordUpdatedAt, "Not changed yet")}</small>
          </div>
        </div>
      </section>

      <section className="settings-grid">
        <article className="settings-card">
          <CardHead
            icon={<ProfileIcon />}
            eyebrow="Profile Information"
            title="Admin contact details"
            description="Update your name and direct contact details for the admin workspace."
          />

          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <label className="settings-field">
              <span>Full Name</span>
              <input
                value={profile.fullName}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...(current ?? profile),
                    fullName: event.target.value,
                  }))
                }
                placeholder="Admin Novatech Machinery"
              />
            </label>

            <label className="settings-field">
              <span>Phone</span>
              <input
                value={profile.phone}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...(current ?? profile),
                    phone: event.target.value,
                  }))
                }
                placeholder="+91 9646255855"
              />
            </label>

            <div className="settings-actions">
              <button className="primary-button" type="submit">
                Save Profile
              </button>
              <NoticeText notice={profileNotice} />
            </div>
          </form>
        </article>

        <article className="settings-card settings-card-wide">
          <CardHead
            icon={<MailIcon />}
            eyebrow="Email / SMTP Configuration"
            title="Customer-facing mail delivery"
            description="Configure SMTP to send quote confirmations, alerts and admin notifications."
          />

          <form className="settings-form" onSubmit={handleSmtpSubmit}>
            <div className="settings-form-grid">
              <label className="settings-field">
                <span>SMTP Host</span>
                <input
                  value={smtp.host}
                  onChange={(event) =>
                    setSmtpDraft((current) => ({
                      ...(current ?? smtp),
                      host: event.target.value,
                    }))
                  }
                  placeholder="smtp.gmail.com"
                />
              </label>
              <label className="settings-field">
                <span>SMTP Port</span>
                <input
                  value={smtp.port}
                  onChange={(event) =>
                    setSmtpDraft((current) => ({
                      ...(current ?? smtp),
                      port: event.target.value,
                    }))
                  }
                  placeholder="587"
                />
              </label>
            </div>

            <label className="settings-field">
              <span>SMTP Username / Email</span>
              <input
                value={smtp.username}
                onChange={(event) =>
                  setSmtpDraft((current) => ({
                    ...(current ?? smtp),
                    username: event.target.value,
                  }))
                }
                placeholder="admin@novatechmachinery.com"
              />
            </label>

            <label className="settings-field">
              <span>SMTP Password / App Password</span>
              <input
                type="password"
                value={smtp.password}
                onChange={(event) =>
                  setSmtpDraft((current) => ({
                    ...(current ?? smtp),
                    password: event.target.value,
                  }))
                }
                placeholder="Enter app password"
              />
            </label>

            <div className="settings-form-grid">
              <label className="settings-field">
                <span>From Email</span>
                <input
                  type="email"
                  value={smtp.fromEmail}
                  onChange={(event) =>
                    setSmtpDraft((current) => ({
                      ...(current ?? smtp),
                      fromEmail: event.target.value,
                    }))
                  }
                  placeholder="info@novatechmachinery.com"
                />
              </label>
              <label className="settings-field">
                <span>From Name</span>
                <input
                  value={smtp.fromName}
                  onChange={(event) =>
                    setSmtpDraft((current) => ({
                      ...(current ?? smtp),
                      fromName: event.target.value,
                    }))
                  }
                  placeholder="Novatech Machinery"
                />
              </label>
            </div>

            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={smtp.useSsl}
                onChange={(event) =>
                  setSmtpDraft((current) => ({
                    ...(current ?? smtp),
                    useSsl: event.target.checked,
                  }))
                }
              />
              <span className="settings-toggle-ui" aria-hidden="true" />
              <span>Use SSL/TLS (port 465)</span>
            </label>

            <div className="settings-actions">
              <button className="primary-button" type="submit">
                Save SMTP Settings
              </button>
              <NoticeText notice={smtpNotice} />
            </div>

            <div className="settings-divider" />

            <div className="settings-test-row">
              <label className="settings-field grow">
                <span>Send Test Email</span>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                  placeholder="test@example.com"
                />
              </label>
              <button className="secondary-button" type="button" onClick={handleSendTestEmail}>
                Send Test
              </button>
            </div>
          </form>
        </article>

        <article className="settings-card">
          <CardHead
            icon={<AnalyticsIcon />}
            eyebrow="Analytics & Tracking"
            title="Measurement IDs"
            description="Add your analytics IDs to enable website-level visibility and remarketing."
          />

          <form className="settings-form" onSubmit={handleTrackingSubmit}>
            <label className="settings-field">
              <span>Google Analytics Measurement ID</span>
              <input
                value={tracking.googleAnalyticsId}
                onChange={(event) =>
                  setTrackingDraft((current) => ({
                    ...(current ?? tracking),
                    googleAnalyticsId: event.target.value,
                  }))
                }
                placeholder="G-XXXXXXXXXX"
              />
              <small>Found in Google Analytics Admin to Data Streams</small>
            </label>

            <label className="settings-field">
              <span>Meta Pixel ID</span>
              <input
                value={tracking.metaPixelId}
                onChange={(event) =>
                  setTrackingDraft((current) => ({
                    ...(current ?? tracking),
                    metaPixelId: event.target.value,
                  }))
                }
                placeholder="1254549116261073"
              />
              <small>Found in Meta Events Manager to Settings</small>
            </label>

            <label className="settings-field">
              <span>Microsoft Clarity Project ID</span>
              <input
                value={tracking.microsoftClarityId}
                onChange={(event) =>
                  setTrackingDraft((current) => ({
                    ...(current ?? tracking),
                    microsoftClarityId: event.target.value,
                  }))
                }
                placeholder="w8fhp8peo"
              />
              <small>Found in Clarity project settings</small>
            </label>

            <div className="settings-actions">
              <button className="primary-button" type="submit">
                Save Tracking Settings
              </button>
              <NoticeText notice={trackingNotice} />
            </div>
          </form>
        </article>

        <article className="settings-card">
          <CardHead
            icon={<DatabaseIcon />}
            eyebrow="Database Export & Import"
            title="Backup and restore"
            description="Export your workspace as JSON or import a saved snapshot when moving environments."
          />

          <div className="settings-note-box">
            <ul className="settings-note-list">
              <li>Machines, settings, category options and subcategory mapping snapshot me include honge.</li>
              <li>Export file human-readable JSON format me generate hoti hai.</li>
              <li>Import se current locally saved workspace data replace ho jayega.</li>
            </ul>
          </div>

          <div className="settings-actions">
            <button className="primary-button" type="button" onClick={handleExportSnapshot}>
              Export Full Database
            </button>
            <button className="secondary-button" type="button" onClick={handleImportTrigger}>
              Import from JSON File
            </button>
          </div>

          <NoticeText notice={backupNotice} />

          <input
            ref={fileInputRef}
            className="settings-hidden-input"
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
          />
        </article>

        <article className="settings-card">
          <CardHead
            icon={<SecurityIcon />}
            eyebrow="Change Password"
            title="Admin access protection"
            description="Update the admin password hash now, so auth integration can consume it later."
          />

          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <label className="settings-field">
              <span>New Password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Minimum 8 characters"
              />
            </label>

            <label className="settings-field">
              <span>Confirm New Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter new password"
              />
            </label>

            <div className="settings-actions">
              <button className="primary-button" disabled={isPasswordSaving} type="submit">
                {isPasswordSaving ? "Updating..." : "Change Password"}
              </button>
              <NoticeText notice={securityNotice} />
            </div>

            <div className="settings-password-meta">
              <span>Last changed</span>
              <strong>{formatAdminDate(security.passwordUpdatedAt, "Not changed yet")}</strong>
            </div>
          </form>
        </article>
      </section>
    </AdminShell>
  );
}

type CardHeadProps = {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

function CardHead({ icon, eyebrow, title, description }: CardHeadProps) {
  return (
    <div className="settings-card-head">
      <div className="settings-card-icon">{icon}</div>
      <div>
        <span className="settings-card-eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function NoticeText({ notice }: { notice: Notice | null }) {
  if (!notice) {
    return null;
  }

  return <p className={`settings-notice ${notice.tone}`}>{notice.text}</p>;
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6.5 7a6.5 6.5 0 0 1 13 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7.5h16v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-9Zm0 0 8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 18V9m7 9V5m7 13v-6M4 19.5h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Zm8 7c0 1.7-3.6 3-8 3s-8-1.3-8-3m16 4c0 1.7-3.6 3-8 3s-8-1.3-8-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4.5 6 7v4.5c0 4.1 2.5 7.7 6 9 3.5-1.3 6-4.9 6-9V7l-6-2.5Zm0 6v3.5m0 3.5h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
